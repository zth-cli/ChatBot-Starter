<script setup lang="ts">
import { useChat } from '@/chatbot/main/demo'
import { useChatStore } from '@/store'

defineOptions({ name: 'Index' })

const chatStore = useChatStore()

const { sendMessage, stopStream } = useChat({ scrollToBottom: () => {} })
</script>

<template>
  <div class="flex flex-col min-w-0 h-full bg-background">
    <ChatHeader />
    <div class="flex-1 overflow-auto">
      <Button @click="sendMessage('你好')">发送消息</Button>
      <Button @click="stopStream">停止流</Button>
      <p v-for="item in chatStore.currentChatMessages" :key="item.id">{{ item.content }}</p>
    </div>
    <Textarea placeholder="Type your message here." />
  </div>
</template>
