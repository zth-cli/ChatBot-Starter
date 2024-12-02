import { ChatCore } from '.'
import { ChatApiClient, ChatPayload } from './ChatApiClient'
import { ChatMessage, MessageStatus, UseChatHookFn } from './types'
import { useChatStore, useToolStore } from '@/store'

export const useChat: UseChatHookFn = ({ scrollToBottom }) => {
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
        scrollToBottom?.()
      },
      onComplete: (message) => {
        chatStore.updateCurrentChatMessage(message)
        scrollToBottom?.()
      },
      onError: (message, error) => {
        chatStore.updateCurrentChatMessage({
          ...message,
          status: MessageStatus.ERROR,
        })
      },
      onStop: (message) => {
        chatStore.updateCurrentChatMessage({
          ...message,
          status: MessageStatus.STOP,
        })
      },
    },
    new ChatApiClient(`${baseUrl}/llm/skillCenter/plugin/chat/openai/formdata`, '61c36ab3c518418b916a6ffc2190d170'),
  )

  return {
    sendMessage: async (message: string) => {
      const chatId = chatStore.currentChatId
      if (!chatId) return
      chatCore.setApiClientHeaders({
        ChatToken: '27ecabac-764e-4132-b4d2-fa50b7ec1b65',
      })
      await chatCore.sendMessage<ChatPayload>(chatId, {
        chatFlowId: import.meta.env.VITE_CHAT_FLOW_ID,
        messages: [{ role: 'user', content: message }],
      })
    },
    stopStream: () => {
      const chatId = chatStore.currentChatId
      if (chatId) {
        chatCore.stopStream(chatId)
      }
    },
  }
}
