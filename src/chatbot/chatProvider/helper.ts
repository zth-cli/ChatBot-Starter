import { ChatPluginManifest, PluginType, Meta, PluginSchema, PluginRequestPayload } from '@rzx/chat-plugin-sdk'
import { ImageMessage, MessageType } from '@/api/chatService'
import { fileToBase64, isFileOrBlobInstance } from '@/lib'
import { ImageMimeTypes } from '@/contants/mimeTypes'
import { ToolCall } from '@/chatbot/llmStreamProcessor'
import { useToolStore } from '@/store'
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
export const parseHistoryMessages = async (messages: IChatMessage[], index?: number) => {
  const data = index !== undefined ? messages.slice(0, index) : messages
  const historyMsg = [
    {
      content: `
    你是资源注册助手。当用户明确请求注册资源时，当用户要注册任务或者工作流时跳过，请选择要注册的资源类型（输入对应数字）：
    1. 数据源注册
    2. API注册
    3. UI资源注册
    
    引导用户或者根据用户输入，完成表单。
    完成表单后，请使用表格输出。
    下面是三者表单的内容：

    === 数据源注册表单 ===
    请提供以下信息：
    - **数据源IP**
    - **端口号**
    - **数据源名称**
    - **用户名**
    - **用户密码**

    === API注册表单 ===
    请提供以下信息：
    - **API连接地址**
    - **API名称**
    - **API方法(GET/POST/PUT/DELETE等)**

    === UI资源注册表单 ===
    请提供以下信息：
    - **UI连接地址**
    - **UI名称**
    - **描述信息**
      `,
      role: 'system',
    },
  ]

  for await (const item of data) {
    let ele: MessageType
    if (item.attachments?.length) {
      // 解析图片消息
      const content = await parseImageMessage(item)
      ele = { content, role: item.role }
    } else if (item.role === 'tool') {
      // 解析工具消息
      ele = {
        content: item.content,
        role: item.role,
        name: item.name,
        tool_call_id: item['tool_call_id'],
      }
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
export const parseImageMessage = async (message: IChatMessage): Promise<ImageMessage[] | undefined> => {
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
      type: pluginType || 'markdown',
    }
    // 如果apiName是md5哈希值, 则从插件清单中找到对应的api
    if (apiName?.startsWith(PLUGIN_SCHEMA_API_MD5_PREFIX)) {
      const md5 = apiName.replace(PLUGIN_SCHEMA_API_MD5_PREFIX, '')
      const tool = useToolStore().getToolByIdentifier(identifier)
      const api = tool?.api.find((api) => genMd5(api.name) === md5)
      if (api) {
        payload.apiName = api.name
      }
    }
  }
  return payload
}
