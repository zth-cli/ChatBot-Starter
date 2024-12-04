vue3 使用示例

```ts
import { ref, computed } from 'vue'
import { ChatCore } from './main'
import { useToolStore } from '@/store'
import { ChatApiClient, ChatPayload } from './main/ChatApiClient'
import { ChatSessionManager } from './main/ChatSessionManager'
import { ChatConfig, ChatMessage, MessageHandler, MessageStatus, UseChatHookFn } from './main/types'

interface ChatHistory {
  id: string
  messages: ChatMessage[]
  loading: boolean
}

export const useChat: UseChatHookFn = () => {
  const toolStore = useToolStore()

  // 本地状态存储
  const currentChat = ref<ChatHistory>({
    id: crypto.randomUUID(),
    messages: [],
    loading: false,
  })

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
      currentChat.value.loading = true
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
      currentChat.value.messages.push(newMessage)
      return newMessage
    },
    onToken: (message) => {
      const index = currentChat.value.messages.findIndex((m) => m.id === message.id)
      if (index !== -1) {
        currentChat.value.messages[index] = message
      }
    },
    onComplete: (message) => {
      const index = currentChat.value.messages.findIndex((m) => m.id === message.id)
      if (index !== -1) {
        currentChat.value.messages[index] = message
      }
      currentChat.value.loading = false
      sessionManager.cleanupSession(chatId)
    },
    onError: (message, error) => {
      const index = currentChat.value.messages.findIndex((m) => m.id === message.id)
      if (index !== -1) {
        currentChat.value.messages[index] = {
          ...message,
          status: MessageStatus.ERROR,
        }
      }
      currentChat.value.loading = false
      sessionManager.cleanupSession(chatId)
    },
    onStop: (message) => {
      const index = currentChat.value.messages.findIndex((m) => m.id === message.id)
      if (index !== -1) {
        currentChat.value.messages[index] = {
          ...message,
          status: MessageStatus.STOP,
        }
      }
      currentChat.value.loading = false
      sessionManager.cleanupSession(chatId)
    },
  })

  // 创建ChatCore
  const createChatCore = () => new ChatCore(config, createMessageHandler(currentChat.value.id), apiClient)

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
    currentChat.value.messages.push(newMessage)
  }

  // 清空对话历史
  const clearHistory = () => {
    currentChat.value = {
      id: crypto.randomUUID(),
      messages: [],
      loading: false,
    }
  }

  return {
    sendMessage: async (message: string) => {
      const chatId = currentChat.value.id
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

    stopStream: async () => {
      const chatId = currentChat.value.id
      if (chatId) {
        const chatCore = await sessionManager.getSession(chatId)
        await chatCore.stopStream()
        currentChat.value.loading = false
      }
    },

    // 导出方法和状态
    chatHistory: computed(() => currentChat.value),
    clearHistory,
    isLoading: computed(() => currentChat.value.loading),
  }
}
```

vue3 调用示例

```html
<script setup lang="ts">
  const { chatHistory, sendMessage, stopStream, clearHistory, isLoading } = useChat()
</script>

<template>
  <div>
    <div v-for="message in chatHistory.messages" :key="message.id">{{ message.content }}</div>
    <div v-if="isLoading">加载中...</div>
    <button @click="clearHistory">清空对话</button>
  </div>
</template>
```

react 使用示例

```tsx
import { useState, useCallback, useMemo } from 'react'
import { ChatCore } from './main'
import { useToolStore } from '@/store'
import { ChatApiClient, ChatPayload } from './main/ChatApiClient'
import { ChatSessionManager } from './main/ChatSessionManager'
import { ChatConfig, ChatMessage, MessageHandler, MessageStatus, UseChatHookFn } from './main/types'

interface ChatHistory {
  id: string
  messages: ChatMessage[]
  loading: boolean
}

export const useChat: UseChatHookFn = () => {
  const toolStore = useToolStore()

  // 使用 useState 替代 ref
  const [currentChat, setCurrentChat] = useState<ChatHistory>({
    id: crypto.randomUUID(),
    messages: [],
    loading: false,
  })

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
  const apiClient = useMemo(
    () =>
      new ChatApiClient(`${baseUrl}/llm/skillCenter/plugin/chat/openai/formdata`, '61c36ab3c518418b916a6ffc2190d170'),
    [],
  )

  // 更新消息的辅助函数
  const updateMessage = useCallback((messageId: string, updater: (message: ChatMessage) => ChatMessage) => {
    setCurrentChat((prev) => {
      const index = prev.messages.findIndex((m) => m.id === messageId)
      if (index === -1) return prev

      const newMessages = [...prev.messages]
      newMessages[index] = updater(newMessages[index])
      return {
        ...prev,
        messages: newMessages,
      }
    })
  }, [])

  // 创建消息处理器
  const createMessageHandler = useCallback(
    (chatId: string): MessageHandler => ({
      onCreate: () => {
        setCurrentChat((prev) => ({
          ...prev,
          loading: true,
        }))
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
        setCurrentChat((prev) => ({
          ...prev,
          messages: [...prev.messages, newMessage],
        }))
        return newMessage
      },
      onToken: (message) => {
        updateMessage(message.id, () => message)
      },
      onComplete: (message) => {
        updateMessage(message.id, () => message)
        setCurrentChat((prev) => ({
          ...prev,
          loading: false,
        }))
        sessionManager.cleanupSession(chatId)
      },
      onError: (message, error) => {
        updateMessage(message.id, (prev) => ({
          ...prev,
          status: MessageStatus.ERROR,
        }))
        setCurrentChat((prev) => ({
          ...prev,
          loading: false,
        }))
        sessionManager.cleanupSession(chatId)
      },
      onStop: (message) => {
        updateMessage(message.id, (prev) => ({
          ...prev,
          status: MessageStatus.STOP,
        }))
        setCurrentChat((prev) => ({
          ...prev,
          loading: false,
        }))
        sessionManager.cleanupSession(chatId)
      },
    }),
    [updateMessage],
  )

  // 创建ChatCore
  const createChatCore = useCallback(
    () => new ChatCore(config, createMessageHandler(currentChat.id), apiClient),
    [apiClient, createMessageHandler, currentChat.id],
  )

  // 管理会话(ChatCore)
  const sessionManager = useMemo(() => new ChatSessionManager<ChatCore>(createChatCore), [createChatCore])

  const addUserMessage = useCallback((message: string) => {
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      status: MessageStatus.COMPLETE,
      date: new Date().toISOString(),
    }
    setCurrentChat((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }))
  }, [])

  // 清空对话历史
  const clearHistory = useCallback(() => {
    setCurrentChat({
      id: crypto.randomUUID(),
      messages: [],
      loading: false,
    })
  }, [])

  const sendMessage = useCallback(
    async (message: string) => {
      const chatId = currentChat.id
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
    [currentChat.id, addUserMessage, sessionManager, apiClient],
  )

  const stopStream = useCallback(async () => {
    const chatId = currentChat.id
    if (chatId) {
      const chatCore = await sessionManager.getSession(chatId)
      await chatCore.stopStream()
      setCurrentChat((prev) => ({
        ...prev,
        loading: false,
      }))
    }
  }, [currentChat.id, sessionManager])

  return {
    sendMessage,
    stopStream,
    chatHistory: currentChat,
    clearHistory,
    isLoading: currentChat.loading,
  }
}
```

react 调用示例

```tsx
function ChatComponent() {
  const { chatHistory, sendMessage, stopStream, clearHistory, isLoading } = useChat()

  return (
    <div>
      {chatHistory.messages.map((message) => (
        <div key={message.id}>{message.content}</div>
      ))}
      {isLoading && <div>加载中...</div>}
      <button onClick={clearHistory}>清空对话</button>
    </div>
  )
}
```
