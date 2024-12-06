import { ChatCore } from './main'
import { useChatStore, useToolStore } from '@/store'
import { ChatApiClient, ChatPayload } from './main/ChatApiClient'
import { ChatSessionManager } from './main/ChatSessionManager'
import { ChatConfig, ChatMessage, MessageHandler, MessageStatus, UseChatHookFn } from './main/types'

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
  const apiClient = new ChatApiClient(
    `${baseUrl}/llm/skillCenter/plugin/chat/openai/formdata`,
    '61c36ab3c518418b916a6ffc2190d170',
  )

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
    onComplete: (message) => {
      chatStore.updateCurrentChatMessage(message)
      chatStore.updateChatHistoryStatusById(chatId, false)
      sessionManager.cleanupSession(chatId)
      /**
       * 1. 可以调用工具，如果有
       * 2. 可以让模型根据返回内容生成推荐问题
       * 3. 可以让模型根据返回内容生成一个对话标题
       */
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
        ChatToken: '27ecabac-764e-4132-b4d2-fa50b7ec1b65',
      })
      await chatCore.sendMessage<ChatPayload>({
        chatFlowId: import.meta.env.VITE_CHAT_FLOW_ID,
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
          ChatToken: '27ecabac-764e-4132-b4d2-fa50b7ec1b65',
        })
        await chatCore.sendMessage<ChatPayload>({
          chatFlowId: import.meta.env.VITE_CHAT_FLOW_ID,
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
