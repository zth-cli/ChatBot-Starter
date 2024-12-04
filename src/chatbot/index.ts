import { ChatCore } from './main'
import { useChatStore, useToolStore } from '@/store'
import { ChatApiClient, ChatPayload } from './main/ChatApiClient'
import { ChatMessage, MessageHandler, MessageStatus, UseChatHookFn } from './main/types'

const MAX_CONCURRENT_CHATS = 3 // 最大同时会话数量

export const useChat: UseChatHookFn = () => {
  const chatStore = useChatStore()
  const toolStore = useToolStore()

  // 配置
  const config = {
    maxRetries: 3,
    retryDelay: 1000,
    typingDelay: {
      min: 10,
      max: 20,
    },
  }

  const baseUrl = import.meta.env.DEV ? '/api' : ''
  const apiClient = new ChatApiClient(
    `${baseUrl}/llm/skillCenter/plugin/chat/openai/formdata`,
    '61c36ab3c518418b916a6ffc2190d170',
  )

  // 存储不同会话的 ChatCore 实例和最后使用时间
  const chatCoreMap = new Map<
    string,
    {
      core: ChatCore
      lastUsed: number
    }
  >()

  // 清理过期或完成的会话
  const cleanupChatCore = async (chatId: string) => {
    const chatCore = chatCoreMap.get(chatId)
    if (chatCoreMap.has(chatId)) {
      // await chatCore.core.stopStream() // 先停止输出流
      chatCoreMap.delete(chatId)
    }
  }

  // 确保会话数量不超过限制
  const ensureMaxConcurrentChats = async () => {
    if (chatCoreMap.size >= MAX_CONCURRENT_CHATS) {
      // 找到最早使用的会话并删除
      let oldestChatId = ''
      let oldestTime = Date.now()

      chatCoreMap.forEach((value, key) => {
        if (value.lastUsed < oldestTime) {
          oldestTime = value.lastUsed
          oldestChatId = key
        }
      })

      if (oldestChatId) {
        await cleanupChatCore(oldestChatId)
      }
    }
  }

  // 获取或创建特定会话的 ChatCore 实例
  const getChatCore = async (chatId: string) => {
    const existing = chatCoreMap.get(chatId)
    if (existing) {
      existing.lastUsed = Date.now()
      return existing.core
    }

    await ensureMaxConcurrentChats()

    const messageHandler: MessageHandler = {
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
        cleanupChatCore(chatId) // 完成时清理
      },
      onError: (message, error) => {
        chatStore.updateCurrentChatMessage({
          ...message,
          status: MessageStatus.ERROR,
        })
        chatStore.updateChatHistoryStatusById(chatId, false)
        cleanupChatCore(chatId) // 错误时清理
      },
      onStop: (message) => {
        chatStore.updateCurrentChatMessage({
          ...message,
          status: MessageStatus.STOP,
        })
        cleanupChatCore(chatId) // 停止时清理
      },
    }

    const chatCore = new ChatCore(config, messageHandler, apiClient)
    chatCoreMap.set(chatId, {
      core: chatCore,
      lastUsed: Date.now(),
    })

    return chatCore
  }

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
      const chatCore = await getChatCore(chatId)

      apiClient.setApiClientHeaders({
        ChatToken: '27ecabac-764e-4132-b4d2-fa50b7ec1b65',
      })
      await chatCore.sendMessage<ChatPayload>({
        chatFlowId: import.meta.env.VITE_CHAT_FLOW_ID,
        messages: [{ role: 'user', content: message }],
      })
    },

    stopStream: async () => {
      const chatId = chatStore.currentChatId
      if (chatId) {
        const chatCore = await getChatCore(chatId)
        await chatCore.stopStream()
        chatStore.updateChatHistoryStatusById(chatId, false)
      }
    },
  }
}
