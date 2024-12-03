import { ChatCore } from './main'
import { ChatApiClient, ChatPayload } from './main/ChatApiClient'
import { ChatMessage, MessageStatus, UseChatHookFn } from './main/types'
import { useChatStore, useToolStore } from '@/store'

export const useChat: UseChatHookFn = () => {
  const chatStore = useChatStore()
  const toolStore = useToolStore()
  const baseUrl = import.meta.env.DEV ? '/api' : ''
  const chatCore = new ChatCore(
    {
      maxConcurrentChats: 3,
      maxRetries: 3,
      retryDelay: 1000,
      typingDelay: { min: 10, max: 20 },
    },
    {
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
        chatStore.currentChatHistory.loading = false
      },
      onError: (message, error) => {
        chatStore.updateCurrentChatMessage({
          ...message,
          status: MessageStatus.ERROR,
        })
        chatStore.currentChatHistory.loading = false
      },
      onStop: (message) => {
        chatStore.updateCurrentChatMessage({
          ...message,
          status: MessageStatus.STOP,
        })
        chatStore.currentChatHistory.loading = false
      },
    },
    new ChatApiClient(`${baseUrl}/llm/skillCenter/plugin/chat/openai/formdata`, '61c36ab3c518418b916a6ffc2190d170'),
  )

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
      chatCore.setApiClientHeaders({
        ChatToken: '27ecabac-764e-4132-b4d2-fa50b7ec1b65',
      })
      await chatCore.sendMessage<ChatPayload>(chatId, {
        chatFlowId: import.meta.env.VITE_CHAT_FLOW_ID,
        messages: [{ role: 'user', content: message }],
      })
    },
    stopStream: async () => {
      const chatId = chatStore.currentChatId
      if (chatId) {
        await chatCore.stopStream(chatId)
      }
    },
  }
}
