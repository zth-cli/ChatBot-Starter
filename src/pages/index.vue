<script setup lang="ts">
import { cn } from '@/lib'
import { Bot, MessageCircle } from 'lucide-vue-next'
import { useChat } from '@/chatbot'
import { useChatStore } from '@/store'
import { storeToRefs } from 'pinia'

defineOptions({ name: 'Index' })

const message = ref('')

const { sendMessage } = useChat({ scrollToBottom: () => {} })
const chatStore = useChatStore()
const { currentChatId, currentChatHistory } = storeToRefs(chatStore)
const router = useRouter()
// 开始一个新会话
const startNewChat = () => {
  if (!message.value) return
  chatStore.insertNewChatHistory()
  sendMessage(message.value)
  router.push(`/chat/${currentChatId.value}`)
}
</script>

<template>
  <div class="flex w-full h-full">
    <ChatContainer>
      <div :class="cn('flex flex-col h-full bg-background w-full')">
        <ChatHeader />
        <div class="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4">
          <div class="w-full mx-auto max-w-3xl px-4 text-center leading-8">
            <p class="flex items-center justify-center gap-x-3 mb-5">
              <Bot class="size-10" /> + <MessageCircle class="size-10" />
            </p>

            <p>使用 vue3 + shadcn-vue + tailwindcss 和人工智能软件开发工具包构建的聊天机器人模板。</p>
            <p>在客户端使用 “useChat” 钩子，以创建无缝的聊天体验。</p>
          </div>
        </div>
        <div class="flex items-end mx-auto px-4 bg-background pb-4 md:pb-12 gap-2 w-full md:max-w-3xl">
          <Textarea v-model="message" class="bg-muted rounded-lg resize-none" placeholder="发送消息提问" />
          <Button @click="startNewChat">发送</Button>
        </div>
      </div>
    </ChatContainer>
  </div>
</template>
