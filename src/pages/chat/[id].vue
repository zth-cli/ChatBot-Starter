<script setup lang="ts">
import { SidebarProviderContext } from '@/components/Sidebar/SidebarProvider.vue'
import ChatMessages from '@/components/ChatMessages/index.vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/store'
import { useChat } from '@/chatbot'
import { cn } from '@/lib'

const message = ref('')
const chatStore = useChatStore()
const { currentChatMessages } = storeToRefs(chatStore)
const { sendMessage, stopStream } = useChat({ scrollToBottom: () => {} })
const isWorkspace = ref(false)

const { isCollapsed } = inject<SidebarProviderContext>('sidebar')!
// isWorkspace为true时，工作台模式，侧边栏折叠
watch(isWorkspace, (value) => {
  if (value) {
    isCollapsed.value = true
  }
})

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
        <P>工作台</P>
      </template>
      <div :class="cn('flex flex-col h-full bg-background w-full')">
        <ChatHeader />
        <div class="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4">
          <ChatMessages :messages="currentChatMessages" :is-at-bottom="true" />
        </div>
        <div class="flex items-end mx-auto px-4 bg-background pb-4 md:pb-12 gap-2 w-full md:max-w-3xl">
          <Textarea v-model="message" class="bg-muted rounded-lg resize-none" placeholder="发送消息提问" />
          <Button @click="handleSendMessage">发送</Button>
          <Button @click="isWorkspace = !isWorkspace">切换工作台模式</Button>
        </div>
      </div>
    </ChatContainer>
  </div>
</template>
