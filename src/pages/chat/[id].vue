<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/store'
import { useChat } from '@/chatbot/main/demo'

const message = ref('')
const route = useRoute()
const chatStore = useChatStore()
const { currentChatMessages, currentChatId } = storeToRefs(chatStore)
const { sendMessage, stopStream } = useChat({ scrollToBottom: () => {} })

// 使用类型断言
const chatId = computed(() => {
  const params = route.params as { id?: string }
  return params.id || '' // 提供默认值以避免 undefined
})
</script>

<template>
  <div class="flex flex-col min-w-0 h-full bg-background">
    <ChatHeader />
    <!-- {{ currentChatMessages }} -->
    <div class="flex-1 overflow-auto">
      <div v-for="message in currentChatMessages" :key="message.id" class="w-full mx-auto max-w-3xl px-4">
        {{ message.content }}
      </div>
      <div class="shrink-0 min-w-[24px] min-h-[24px]"></div>
    </div>
    <div class="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
      <Textarea v-model="message" class="bg-muted rounded-lg resize-none" placeholder="发送消息提问" />
      <Button @click="sendMessage(message)">发送</Button>
    </div>
  </div>
</template>
