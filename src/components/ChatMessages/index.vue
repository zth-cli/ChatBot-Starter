<script setup lang="ts">
import ChatLoadingDots from '@/components/ChatLoadingDots/index.vue'
import ChatItem from '@/components/ChatItem'
import { ChatMessage } from '@/chatbot/main/types'

defineOptions({ name: 'ChatMessages' })
const props = defineProps<{
  messages: ChatMessage[]
  isAtBottom: boolean
}>()

const emit = defineEmits<{
  'update:scrollRef': [el: any]
  refresh: [params: { index: number }]
  'click-suggest': [item: string]
  'scroll-to-bottom': []
}>()

const msgLength = computed(() => props.messages.length - 1)
const isLastMessageAssistant = computed(() => {
  if (props.messages.length === 0) return false
  return props.messages[msgLength.value].role === 'assistant'
})
</script>

<template>
  <div v-for="(item, index) in messages" :key="item.id" class="w-full mx-auto max-w-3xl px-4">
    <ChatItem.User v-if="item.role === 'user'" :item="item" />
    <ChatItem.AI
      v-else
      :item="item"
      :loading="ChatLoadingDots"
      :need-refresh="isLastMessageAssistant && msgLength === index"
      :show-action-always="isLastMessageAssistant && msgLength === index"
      @refresh="emit('refresh', { index })"
      @click-suggest="emit('click-suggest', $event)"
    />
  </div>
  <div class="shrink-0 min-w-[24px] min-h-[24px]"></div>
</template>

<style lang="scss" scoped></style>
