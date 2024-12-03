<template>
  <aside
    :class="
      cn(
        // 基础样式
        'fixed inset-y-0 z-10 h-full',
        'transition-[left,right,width] ease-linear duration-200',
        // 响应式显示
        'flex',
        // 宽度控制
        'w-[--sidebar-width] left-0',
        'group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]',
      )
    "
  >
    <div class="flex h-full w-full flex-col">
      <!-- 顶部标题栏 -->
      <div class="flex h-14 items-center border-b px-4">
        <h2 class="flex items-center gap-2 font-semibold">
          <Bot class="h-5 w-5" />
          <span v-show="!isCollapsed">Chatbot</span>
        </h2>
        <NewChatButton />
      </div>

      <!-- 聊天历史列表 -->
      <ChatHistory
        :is-collapsed="isCollapsed"
        :chat-history-list="chatHistoryList"
        :current-chat-id="currentChatId"
        @more-action="handleMoreAction"
        @switch-chat="handleSwitchChat"
      />

      <!-- 底部用户信息 -->
      <div class="border-t p-4">
        <div class="flex items-center gap-2">
          <Avatar class="h-8 w-8">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <span v-show="!isCollapsed" class="text-sm">770304867@qq.com</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/store'
import ChatHistory from './ChatHistory.vue'
import NewChatButton from './NewChatButton.vue'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Bot } from 'lucide-vue-next'
import type { SidebarProviderContext } from '@/components/Sidebar/SidebarProvider.vue'

const { isCollapsed } = inject<SidebarProviderContext>('sidebar')!

const router = useRouter()
const chatStore = useChatStore()
const { chatHistoryList, currentChatId } = storeToRefs(chatStore)

const handleMoreAction = (type: string, id: string) => {
  if (type === 'delete') {
    chatStore.deleteChatHistory(id, () => {
      router.push('/')
    })
  }
}

const handleSwitchChat = (id: string) => {
  chatStore.getChatHistoryById(id)
  router.push(`/chat/${id}`)
}
</script>
