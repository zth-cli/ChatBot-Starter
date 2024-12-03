<script setup lang="ts">
import { SidebarProviderContext } from '@/components/Sidebar/SidebarProvider.vue'
import ChatMessages from '@/components/ChatMessages/index.vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/store'
import { useChat } from '@/chatbot'

import { cn } from '@/lib'

const message = ref('')
const chatStore = useChatStore()
const { currentChatMessages, currentChatHistory } = storeToRefs(chatStore)
const isLoading = computed(() => !!currentChatHistory.value?.loading)
const { sendMessage, stopStream } = useChat()

// 刷新界面时根据chatId获取聊天记录
const route = useRoute()
const chatId = (route.params as { id: string })?.id
onMounted(() => {
  if (chatId && !currentChatMessages.value.length) {
    chatStore.getChatHistoryById(chatId)
  }
})

// isWorkspace为true时，工作台模式，侧边栏折叠
const isWorkspace = ref(false)
const { isCollapsed } = inject<SidebarProviderContext>('sidebar')!
watch(isWorkspace, (value) => {
  if (value) {
    isCollapsed.value = true
  }
})

// 发送消息
const handleSendMessage = () => {
  if (!message.value) return
  sendMessage(message.value)
  message.value = ''
}
</script>

<template>
  <div class="flex w-full h-full">
    <ChatContainer v-model="isWorkspace">
      <template #workspace>
        <p>工作台</p>
      </template>
      <div :class="cn('flex flex-col h-full bg-background w-full')">
        <ChatHeader />
        <div class="flex flex-col min-w-0 gap-6 flex-1 pt-4">
          <ChatMessages :messages="currentChatMessages" :is-at-bottom="true" />
        </div>
        <div class="flex items-end mx-auto px-4 bg-background p-4 md:pb-10 gap-2 w-full md:max-w-3xl">
          <ChatTextArea v-model="message" :loading="isLoading" @send="handleSendMessage" @stop="stopStream" />

          <!-- <Button @click="handleSendMessage">发送</Button>
          <Button @click="isWorkspace = !isWorkspace">切换工作台模式</Button> -->
        </div>
      </div>
    </ChatContainer>
  </div>
</template>
