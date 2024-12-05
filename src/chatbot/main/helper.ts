import { ChatPluginManifest, PluginType, Meta, PluginSchema, PluginRequestPayload } from '@rzx/chat-plugin-sdk'
import { ChatMessage, ImageMessage, MessageType, ToolCall } from './types'
import { AbortError, fileToBase64, isFileOrBlobInstance } from '@/lib'
import { ImageMimeTypes } from '@/chatbot/constants/mimeTypes'
import { Md5 } from 'ts-md5'

export const getPluginTitle = (meta?: Meta) => meta?.title
export const getPluginDesc = (meta?: Meta) => meta?.description

export const getPluginTags = (meta?: Meta) => meta?.tags
export const getPluginAvatar = (meta?: Meta) => meta?.avatar || '🧩'

export const genMd5 = (name: string) => Md5.hashStr(name).toString()

export const isSettingSchemaNonEmpty = (schema?: PluginSchema) =>
  schema?.properties && Object.keys(schema.properties).length > 0

export const PLUGIN_SCHEMA_SEPARATOR = '____'
export const PLUGIN_SCHEMA_API_MD5_PREFIX = 'MD5HASH_'

export const getPluginNameByIdentifier = (identifier: string) => {
  const [pluginName, pluginFunctionName, pluginType] = identifier.split(PLUGIN_SCHEMA_SEPARATOR)
  return [pluginName, pluginFunctionName, pluginType] as [string, string, PluginType]
}
export const genToolCallingName = (identifier: string, name: string, type: string = 'default') => {
  const pluginType = type && type !== 'default' ? `${PLUGIN_SCHEMA_SEPARATOR + type}` : ''

  // 将插件的 identifier 作为前缀，避免重复
  const apiName = identifier + PLUGIN_SCHEMA_SEPARATOR + name + pluginType

  // 如果生成的名称超过64个字符（OpenAI GPT的限制）
  // 使用MD5对name进行哈希处理
  //在哈希值前添加特定前缀，重新组合生成新的API名称
  // if (apiName.length >= 64) {
  //   const md5Content = PLUGIN_SCHEMA_API_MD5_PREFIX + genMd5(name)

  //   apiName = identifier + PLUGIN_SCHEMA_SEPARATOR + md5Content + pluginType
  // }

  return apiName
}

/**
 * @description 解析插件清单，生成系统角色
 * @param plugins 插件清单
 * @deprecated 使用插件清单的systemRole字段
 */
export const enabledSysRoles = (plugins: ChatPluginManifest[]) => {
  const toolsSystemRole = plugins
    .map((plugin) => {
      const meta = plugin?.meta
      const title = getPluginTitle(meta) || plugin?.identifier
      const systemRole = plugin?.systemRole || getPluginDesc(meta)
      const methods = plugin?.api
        .map((m) => [`#### ${genToolCallingName(plugin?.identifier, m.name, plugin.type)}`, m.description].join('\n\n'))
        .join('\n\n')

      return [`### ${title}`, systemRole, 'The APIs you can use:', methods].join('\n\n')
    })
    .filter(Boolean)
  if (toolsSystemRole.length > 0) {
    return ['## Tools', 'You can use these tools below:', ...toolsSystemRole].filter(Boolean).join('\n\n')
  }

  return ''
}

/**
 * @description 解析插件清单，生成工具调用
 * @param plugins 插件清单
 */
export const parseAvailableTools = (plugins: ChatPluginManifest[]) => {
  return plugins
    .map((plugin) => {
      return plugin?.api.map((api) => ({
        type: 'function',
        function: {
          name: genToolCallingName(plugin.identifier, api.name, plugin.type),
          description: api.description,
          parameters: api.parameters,
        },
      }))
    })
    .flat()
}

/**
 * @description 解析历史消息
 */
export const parseHistoryMessages = async (messages: ChatMessage[], index?: number) => {
  const data = index !== undefined ? messages.slice(0, index) : messages
  const historyMsg = []

  for await (const item of data) {
    let ele: MessageType
    if (item.attachments?.length) {
      // 解析图片消息
      const content = await parseImageMessage(item)
      ele = { content, role: item.role }
    } else {
      // 解析文本消息
      ele = { content: item.content, role: item.role }
    }
    historyMsg.push(ele)
  }
  return historyMsg
}

/**
 * @description 解析图片消息
 */
export const parseImageMessage = async (message: ChatMessage): Promise<ImageMessage[] | undefined> => {
  const data: ImageMessage[] = []
  for await (const item of message!.attachments!) {
    if (ImageMimeTypes.includes(item.type)) {
      try {
        let base64Str = item.file
        if (isFileOrBlobInstance(item.file)) {
          base64Str = await fileToBase64(item.file)
        }
        data.push({
          image_url: {
            detail: 'auto',
            url: base64Str,
          },
          type: 'image_url',
        })
      } catch (error) {
        /* empty */
      }
    }
    data.unshift({ text: message.content, type: 'text' })
    return data
  }
}

/**
 * @description 处理工具调用响应
 * 如果apiName是md5哈希值, 则从插件清单中找到对应的api
 * 否则, 直接使用apiName
 */
export const handleToolCallsResponse = (toolCalls: ToolCall[]) => {
  let payload: PluginRequestPayload | undefined
  const firstCall = toolCalls[0]
  if (firstCall?.id && firstCall?.function?.name) {
    const [identifier, apiName, pluginType] = getPluginNameByIdentifier(firstCall.function.name)
    payload = {
      id: firstCall.id,
      apiName,
      arguments: '', // 将在后续流中累积
      identifier,
      type: pluginType,
    }
    // 如果apiName是md5哈希值, 则从插件清单中找到对应的api
    // if (apiName?.startsWith(PLUGIN_SCHEMA_API_MD5_PREFIX)) {
    //   const md5 = apiName.replace(PLUGIN_SCHEMA_API_MD5_PREFIX, '')
    //   const tool = useToolStore().getToolByIdentifier(identifier)
    //   const api = tool?.api.find((api) => genMd5(api.name) === md5)
    //   if (api) {
    //     payload.apiName = api.name
    //   }
    // }
  }

  // 然后循环toolCalls，将arguments累加
  for (const tool of toolCalls) {
    if (tool.function?.arguments) {
      payload!.arguments += tool.function.arguments
    }
  }
  return payload
}
export const sleep = (ms: number, signal?: AbortSignal) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    // 如果 signal 被中止，清除定时器并拒绝 Promise
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new AbortError('计时器已被中止'))
    })
  })
}
