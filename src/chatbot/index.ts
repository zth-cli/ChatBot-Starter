import { ChatCore } from './main'
import { useChatStore, useToolStore } from '@/store'
import { ChatApiClient, ChatPayload } from './main/ChatApiClient'
import { ChatSessionManager } from './main/ChatSessionManager'
import { ChatConfig, ChatMessage, MessageHandler, MessageStatus, UseChatHookFn, ToolResult } from './main/types'
import { handleToolCallsResponse } from './main/helper'

export const useChat: UseChatHookFn = () => {
  const chatStore = useChatStore()
  const toolStore = useToolStore()

  // 配置
  const config: ChatConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    typingDelay: {
      min: 10,
      max: 20,
    },
  }

  // 创建API客户端
  const baseUrl = import.meta.env.DEV ? '/api' : ''
  const apiClient = new ChatApiClient(`${baseUrl}/llm/aios/chat/openai`, `${baseUrl}/llm/aios/plugin/gateway`)

  /**
   * @description 处理流式响应的工具调用结束
   * @param message 当前消息
   * @param chatId 会话id
   */
  type SumInfo = { isSummarize: 1 | 2; summarizeInfo: string }
  const handleToolCallsFinish = async (
    message: ChatMessage,
    sessionId: string,
  ): Promise<{ message: ChatMessage; otherInfo: SumInfo }> => {
    let otherInfo: SumInfo
    try {
      const response = await apiClient.gateway({
        sessionId,
        ...message.toolCalls,
      })
      const data = await response.json()
      otherInfo = data.otherInfo
      if (otherInfo?.isSummarize !== 1) {
        message.toolResults = {
          toolCallId: message.toolCalls!.id,
          result: data.code ? data.data : data.msg,
        } as ToolResult
      }

      message.status = data.code ? MessageStatus.COMPLETE : MessageStatus.ERROR
    } catch (error) {
      message.toolResults = { toolCallId: message.toolCalls!.id, result: '调用失败' }
      message.status = MessageStatus.ERROR
    }
    return { message, otherInfo }
  }
  /**
   * @description 针对search-engine的特殊处理
   * @param message 当前消息
   * @param chatId 会话id
   */
  const handleSearchEngineToolCallsFinish = async (message: ChatMessage, otherInfo: SumInfo, chatId: string) => {
    if (otherInfo?.isSummarize === 1) {
      const lastContent = `总结内容: ${JSON.stringify(otherInfo?.summarizeInfo)}`
      const chatCore = await sessionManager.getSession(chatId)
      chatCore.setCurrentMessage({ ...message, content: '', status: MessageStatus.PENDING })
      await chatCore.sendMessage<ChatPayload>({
        sessionId: chatId,
        messages: [{ content: lastContent, role: 'user' as const }],
      })
    }
  }

  // 创建消息处理器
  const createMessageHandler = (chatId: string): MessageHandler => ({
    onCreate: () => {
      chatStore.currentChatHistory.loading = true
      const newMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant' as const,
        content: '',
        status: MessageStatus.PENDING,
        date: new Date().toISOString(),
        toolCalls: [],
        toolResults: [],
        likeStatus: 0,
      }
      chatStore.insertChatMessage(newMessage)
      return newMessage
    },
    onToken: (message) => {
      chatStore.updateCurrentChatMessage(message)
    },
    onComplete: async (message) => {
      if (message.toolCalls?.length) {
        const toolCalls = handleToolCallsResponse(message.toolCalls)
        message.toolCalls = toolCalls
        const { message: newMessage, otherInfo } = await handleToolCallsFinish(message, chatId)
        if (otherInfo?.isSummarize === 1) {
          await handleSearchEngineToolCallsFinish(newMessage, otherInfo, chatId)
        } else {
          chatStore.updateCurrentChatMessage({ ...newMessage, status: MessageStatus.COMPLETE })
        }
      } else {
        chatStore.updateCurrentChatMessage(message)
      }
      // 获取推荐问题
      chatStore.updateChatHistoryStatusById(chatId, false)
      sessionManager.cleanupSession(chatId)
    },
    onError: (message, error) => {
      chatStore.updateCurrentChatMessage({
        ...message,
        status: MessageStatus.ERROR,
      })
      chatStore.updateChatHistoryStatusById(chatId, false)
      sessionManager.cleanupSession(chatId)
    },
    onStop: (message) => {
      chatStore.updateCurrentChatMessage({
        ...message,
        status: MessageStatus.STOP,
      })
      sessionManager.cleanupSession(chatId)
    },
  })

  // 创建ChatCore
  const createChatCore = () => new ChatCore(config, createMessageHandler(chatStore.currentChatId), apiClient)

  // 管理会话(ChatCore)
  const sessionManager = new ChatSessionManager<ChatCore>(createChatCore)

  const addUserMessage = (message: string) => {
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      status: MessageStatus.COMPLETE,
      date: new Date().toISOString(),
    }
    chatStore.insertChatMessage(newMessage)
  }

  return {
    sendMessage: async (message: string) => {
      const chatId = chatStore.currentChatId
      if (!chatId) return

      addUserMessage(message)
      const chatCore = await sessionManager.getSession(chatId)

      apiClient.setApiClientHeaders({
        ChatToken: import.meta.env.VITE_CHAT_TOKEN,
      })
      await chatCore.sendMessage<ChatPayload>({
        question: message,
        sessionId: chatId,
        messages: [{ role: 'user', content: message }],
      })
    },
    regenerateMessage: async (index: number) => {
      const chatId = chatStore.currentChatId
      if (!chatId) return

      const messages = chatStore.currentChatMessages
      // 检查索引是否有效
      if (index < 0 || index >= messages.length) return

      // 获取指定索引位置的消息和它的前一条消息
      const targetMessage = messages[index]
      const previousMessage = index > 0 ? messages[index - 1] : null

      // 确保目标消息是助手消息，且前一条是用户消息
      if (targetMessage.role === 'assistant' && previousMessage?.role === 'user') {
        // 删除targetMessage
        messages.splice(index, 1)

        // 重新发送用户消息
        const userMessage = previousMessage.content
        const chatCore = await sessionManager.getSession(chatId)
        apiClient.setApiClientHeaders({
          ChatToken: import.meta.env.VITE_CHAT_TOKEN,
        })
        await chatCore.sendMessage<ChatPayload>({
          question: userMessage,
          sessionId: chatId,
          messages: [{ role: 'user', content: userMessage }],
        })
      }
    },
    stopStream: async () => {
      const chatId = chatStore.currentChatId
      if (chatId) {
        const chatCore = await sessionManager.getSession(chatId)
        await chatCore.stopStream()
        chatStore.updateChatHistoryStatusById(chatId, false)
      }
    },
  }
}
