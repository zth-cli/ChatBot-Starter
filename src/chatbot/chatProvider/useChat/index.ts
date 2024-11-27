import { storeToRefs } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import { ChatService, Tool } from '@/api/chatService'
import { sleep, errorAnalyzer, isAbortError } from '@/lib'
import { getTitleByContent, getSuggestMessage } from '@/api'
import { ChatStore, useToolStore, userStore } from '@/store'
import { ChatHookFn, ChatHookParams, ChatParams } from '@/chatbot/ChatProvider/types'
import { createOpenAIStreamProcessor, ChatSessionManager, ChatSession } from '@/chatbot/llmStreamProcessor'
import { parseAvailableTools, parseHistoryMessages, handleToolCallsResponse } from '../helper'

interface HandleStreamResponseParams {
  response: Response
  session: ChatSession
  chatId: string
  message?: string
  runSuggest?: boolean
}
const CHAT_CONFIG = {
  MAX_CONCURRENT_CHATS: 3,
  CHAT_FLOW_ID: import.meta.env.VITE_CHAT_FLOW_ID,
  MODEL: 'gpt-40',
  TYPING_DELAY: { min: 10, max: 20 },
  TEMPERATURE: 0.6,
  TOP_P: 1,
} as const

export const useChat: ChatHookFn = ({ scrollToBottom }: ChatParams) => {
  const sessionManager = new ChatSessionManager(CHAT_CONFIG.MAX_CONCURRENT_CHATS)
  const chatService = new ChatService()
  const chatStore = ChatStore()
  const { currentChatMessages, currentChatHistory } = storeToRefs(chatStore)
  const toolStore = useToolStore()
  const { manifests } = storeToRefs(toolStore)
  const { userInfo } = storeToRefs(userStore())
  const sendMessage = async (payload: ChatHookParams) => {
    const { index = undefined, message } = payload

    const targetHistoryId = currentChatHistory.value?.id
    if (!targetHistoryId) return
    // 清除之前助手消息的建议
    if (currentChatMessages.value) {
      currentChatMessages.value.forEach((msg) => {
        if (msg.role === 'assistant') {
          msg.suggestMessage = undefined
        }
      })
    }
    // 检查是否可以开始新的对话
    // if (!sessionManager.getSessionStatus().canStartNew) {
    //   console.warn(`当前已达到最大并发对话数 ${MAX_CONCURRENT_CHATS}，请等待其他对话完成后再试`)
    //   return
    // }
    const availableTools: Tool[] = parseAvailableTools(manifests.value)
    const session = sessionManager.getOrCreateSession(targetHistoryId, stopStream)
    session.isLoading = true
    session.startTime = Date.now()

    const messages = await parseHistoryMessages(currentChatMessages.value, index)
    const targetHistory = chatStore.findChatHistoryById(targetHistoryId)
    if (!targetHistory) return

    targetHistory.loading = true
    const newMessage = createNewMessage()
    updateHistoryWithMessage(targetHistory, newMessage, index)

    const targetIndex = index === undefined ? currentChatMessages.value.length - 1 : index
    session.lastMessage = targetHistory.children[targetIndex]
    scrollToBottom?.()

    try {
      const response = await createChatStreamRequest(message, messages, availableTools, session.controller)
      await handleStreamResponse({ response, session, chatId: targetHistoryId, message })
    } catch (error) {
      session.lastMessage.content = '终止回答或服务错误, 请重试'
      session.lastMessage.status = 1
      resetState(targetHistoryId)
    }
  }
  /**
   * @description 创建新的消息
   */
  const createNewMessage = (): IChatMessage => ({
    id: uuidv4(),
    role: 'assistant',
    content: '',
    prompt: '',
    date: new Date().toString(),
    status: 3,
  })

  /**
   * @description 更新历史消息
   */
  const updateHistoryWithMessage = (targetHistory: any, newMessage: IChatMessage, index?: number) => {
    if (index === undefined) {
      targetHistory.children.push(newMessage)
    } else {
      targetHistory.children[index].content = ''
      targetHistory.children[index].prompt = ''
      targetHistory.children[index].status = 3
      targetHistory.children[index].likeStatus = 0
      targetHistory.children[index].date = new Date().toString()
      targetHistory.children[index].toolCalls = undefined
      targetHistory.children[index].toolResults = undefined
    }
  }
  /**
   * @description 创建聊天流请求
   */
  const createChatStreamRequest = async (
    message: string | undefined,
    messages: any[],
    availableTools: Tool[],
    controller: AbortController,
  ) => {
    const response = await chatService.createChatStream(
      {
        chatFlowId: CHAT_CONFIG.CHAT_FLOW_ID,
        question: message || '1',
        messages,
        model: CHAT_CONFIG.MODEL,
        stream: true,
        tools: availableTools,
        temperature: CHAT_CONFIG.TEMPERATURE,
        top_p: CHAT_CONFIG.TOP_P,
        frequency_penalty: 0,
        presence_penalty: 0,
      },
      controller.signal,
      userInfo.value.token,
    )

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    return response
  }
  /**
   * @description 处理流式响应
   */
  const handleStreamResponse = async ({
    response,
    session,
    chatId,
    message,
    runSuggest,
  }: HandleStreamResponseParams) => {
    const processor = createOpenAIStreamProcessor({
      onStart: () => (session.pendingToolCalls = undefined),
      onToken: async (token) => handleToken(token, session, chatId),
      onToolCall: (toolCalls) => handleToolCall(session, toolCalls),
      onFinish: () => handleStreamFinish(session, chatId, message, runSuggest),
      onError: () => handleStreamError(session, chatId),
    })

    try {
      const reader = response.body!.pipeThrough(new TextDecoderStream()).pipeThrough(processor).getReader()

      while (true) {
        const { done } = await reader.read()
        if (done) break
      }
    } catch (error) {
      handleStreamError(session, chatId, error)
    }
  }
  /**
   * @description 处理流式响应的token
   */
  const handleToken = async (token: string, session: ChatSession, chatId: string) => {
    if (!session.isLoading || !session.lastMessage) return
    if (!session.lastMessage.content) {
      session.lastMessage.status = 2
    }
    await appendTokenWithDelay(token, session, chatId)
  }
  /**
   * @description 在每个字符后添加延迟
   */
  const appendTokenWithDelay = async (token: string, session: ChatSession, chatId: string) => {
    const chars = token.split('')
    try {
      for (const char of chars) {
        if (!session.isLoading) return
        session.lastMessage!.content += char
        await sleep(
          Math.random() * (CHAT_CONFIG.TYPING_DELAY.max - CHAT_CONFIG.TYPING_DELAY.min) + CHAT_CONFIG.TYPING_DELAY.min,
          session.controller.signal,
        )
        scrollToBottom?.()
      }
    } catch (error) {
      if (isAbortError(error)) {
        resetState(chatId)
      }
    }
  }
  /**
   * @description 处理流式响应的工具调用
   */
  const handleToolCall = (session: ChatSession, toolCalls: any) => {
    if (!session.lastMessage) return
    session.lastMessage.prompt = ''
    session.pendingToolCalls = handleToolCallsResponse(toolCalls)

    for (const tool of toolCalls) {
      if (tool.function?.arguments) {
        session.lastMessage.prompt += tool.function.arguments
        session.pendingToolCalls.arguments += tool.function.arguments
      }
    }
    scrollToBottom?.()
  }
  /**
   * @description 处理流式响应的结束
   */
  const handleStreamFinish = async (session: ChatSession, chatId: string, message: string, runSuggest?: boolean) => {
    if (!session.lastMessage) return
    if (session.pendingToolCalls) {
      switch (session.pendingToolCalls.type) {
        case 'search-engine':
          // 对search-engine进行特殊处理
          await handleSearchEngineToolCallsFinish(session, chatId)
          break
        case 'standalone':
          await handleStandaloneToolCallsFinish(session, chatId)
          break
        default:
          await handleToolCallsFinish(session, chatId)
          break
      }
    } else {
      session.lastMessage.status = 0
    }
    if (runSuggest === undefined || runSuggest) {
      session.lastMessage.suggestMessage = await fetchRecommendations(message)
    }
    scrollToBottom?.()
    console.log('chatId', chatId)
    generateSessionName(chatId)
    resetState(chatId)
  }
  /**
   * @description 处理流式响应的工具调用结束
   */
  const handleToolCallsFinish = async (session: ChatSession, chatId: string) => {
    if (!session.pendingToolCalls || !session.lastMessage) return
    session.lastMessage.toolCalls = session.pendingToolCalls
    // 根据identifier和apiName在manifests中找到对应的插件，判断api集合是否有url
    const manifest = manifests.value.find((plugin) => plugin.identifier === session.lastMessage.toolCalls?.identifier)
    const api = manifest?.api.find((api) => api.name === session.lastMessage.toolCalls?.apiName)
    if (api?.url) {
      try {
        const manifest = manifests.value.find((plugin) => plugin.identifier === session.pendingToolCalls?.identifier)
        const response = await chatService.gateway(
          {
            ...session.pendingToolCalls,
            manifest,
          },
          userInfo.value.token,
        )
        const data = await response.json()
        session.lastMessage.toolResults = data.code ? data.data : data.msg
        session.lastMessage.status = data.code ? 0 : 1
      } catch (error) {
        session.lastMessage.content = '调用失败'
        session.lastMessage.status = 1
      }
    } else {
      session.lastMessage.toolResults = JSON.parse(session.pendingToolCalls.arguments)
      session.lastMessage.status = 0
    }
  }
  /**
   * @description 针对standalone的特殊处理
   */
  const handleStandaloneToolCallsFinish = async (session: ChatSession, chatId: string) => {
    if (!session.pendingToolCalls || !session.lastMessage) return
    session.lastMessage.toolCalls = session.pendingToolCalls
    session.lastMessage.status = 0
  }
  /**
   * @description针对search-engine的特殊处理
   */
  const handleSearchEngineToolCallsFinish = async (session: ChatSession, chatId: string) => {
    await handleToolCallsFinish(session, chatId)
    const messages: IChatMessage[] = [
      {
        id: uuidv4(),
        role: 'user',
        content: `总结内容: ${JSON.stringify(session.lastMessage?.toolResults)}`,
        date: new Date().toString(),
      },
    ]
    session.lastMessage.status = 3
    const response = await createChatStreamRequest('1', messages, [], session.controller)
    await handleStreamResponse({ response, session, chatId, runSuggest: false })
  }

  /**
   * @description 处理流式输出错误
   */
  const handleStreamError = (session: ChatSession, chatId: string, error?: any) => {
    if (error && errorAnalyzer.isStreamAbortError(error)) {
      console.warn('流式输出已经中断')
      resetState(chatId)
      return
    }
    if (session.lastMessage) {
      session.lastMessage.content = '解析错误, 请稍后再试'
      session.lastMessage.status = 1
    }
    generateSessionName(chatId)
    resetState(chatId)
  }

  // 重置状态
  const resetState = (chatId: string) => {
    const session = sessionManager.getSession(chatId)
    const targetHistory = chatStore.findChatHistoryById(chatId)
    if (session && targetHistory) {
      targetHistory.isTemp = false
      targetHistory.loading = false
      sessionManager.deleteSession(chatId)
    }
  }

  const stopStream = async (chatId?: string) => {
    const targetChatId = chatId || currentChatHistory.value?.id
    if (!targetChatId) return
    const session = sessionManager.getSession(targetChatId)
    if (session && session.lastMessage) {
      session.lastMessage.status = 0
      if (!session.lastMessage.content) {
        session.lastMessage.content = '已手动中断'
      }
      generateSessionName(targetChatId)
      session.controller.abort()
      resetState(targetChatId)
    }
  }

  const cleanupSession = (chatId: string) => {
    const session = sessionManager.getSession(chatId)
    if (session) {
      session.controller.abort()
      sessionManager.deleteSession(chatId)
    }
  }

  // 根据对话内容生成会话名称
  const generateSessionName = async (chatId: string) => {
    const targetHistory = chatStore.findChatHistoryById(chatId)
    if (!targetHistory || !targetHistory.isTemp) return
    const content = targetHistory.children.map((item) => item.content).join('')
    const response = await getTitleByContent<{ code: 0 | 1; data: string }>({ question: content })
    if (response.code) {
      targetHistory.name = response.data
    }
  }
  // 获取推荐问题
  const fetchRecommendations = async (question: string) => {
    const response = await getSuggestMessage<{ code: 0 | 1; data: string[] }>({ question })
    return response.code ? response.data : []
  }
  return {
    sendMessage,
    stopStream,
    cleanupSession,
    getSessionStatus: () => sessionManager.getSessionStatus(),
    name: 'useChat',
  }
}
/**
 * 针对让OpenAI在使用互联网查询并总结内容时提供引用来源
 * 请以学术论文的方式总结[主题]：
 * 1. 遵循APA引用格式
 * 2. 区分直接引用和间接引用
 * 3. 在每个重要论点后标注来源
 * 4. 文末提供完整参考文献列表
 */
