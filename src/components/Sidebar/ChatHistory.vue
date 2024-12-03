<template>
  <div class="flex-1 overflow-auto py-2">
    <div class="space-y-2 px-2">
      <template v-for="group in groupedChatHistory" :key="group.label">
        <div class="px-2 py-1.5">
          <span class="text-xs text-muted-foreground">{{ group.label }}</span>
        </div>
        <ChatHistoryItem v-for="chat in group.chats" :key="chat.id" :item="chat" @click="switchChat(chat)">
          <ChatHistoryMoreItem @select="(type, $event) => handleMoreAction(type, chat.id, $event)" />
        </ChatHistoryItem>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/store'

import { ChatHistory } from '@/chatbot/main/types'

const router = useRouter()
const chatStore = useChatStore()
const { chatHistoryList } = storeToRefs(chatStore)

const emit = defineEmits(['more-action'])

const handleMoreAction = (type: string, chatId: string, event: Event) => {
  event.stopPropagation()
  emit('more-action', type, chatId)
}

const switchChat = (chat: ChatHistory) => {
  chatStore.getChatHistoryById(chat.id)
  router.push(`/chat/${chat.id}`)
}

const groupedChatHistory = computed(() => {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const lastWeek = new Date(today)
  lastWeek.setDate(lastWeek.getDate() - 7)

  const groups = {
    today: {
      label: '今天',
      chats: [] as any[],
    },
    yesterday: {
      label: '昨天',
      chats: [] as any[],
    },
    lastWeek: {
      label: '最近7天',
      chats: [] as any[],
    },
    older: {
      label: '更早',
      chats: [] as any[],
    },
  }

  chatHistoryList.value.forEach((chat) => {
    const chatDate = new Date(chat.createTime)
    if (isSameDay(chatDate, today)) {
      groups.today.chats.push(chat)
    } else if (isSameDay(chatDate, yesterday)) {
      groups.yesterday.chats.push(chat)
    } else if (chatDate >= lastWeek) {
      groups.lastWeek.chats.push(chat)
    } else {
      groups.older.chats.push(chat)
    }
  })

  return Object.values(groups).filter((group) => group.chats.length > 0)
})

function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}
</script>
