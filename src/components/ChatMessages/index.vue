<script setup lang="ts">
import ChatLoadingDots from '@/components/ChatLoadingDots/index.vue'
import { ChatMessage } from '@/chatbot/main/types'
import ChatItem from '@/components/ChatItem'
import { FloatButton } from './FloatButton'

import { VList } from 'virtua/vue'

defineOptions({ name: 'ChatMessages' })
const props = defineProps<{
  messages: ChatMessage[]
  isAtBottom: boolean
}>()

const emit = defineEmits<{
  regenerateMessage: [params: { index: number }]
  'click-suggest': [item: string]
}>()

const msgLength = computed(() => props.messages.length - 1)
const isLastMessageAssistant = computed(() => {
  if (props.messages.length === 0) return false
  return props.messages[msgLength.value].role === 'assistant'
})

// 滚动相关逻辑
const listRef = ref<InstanceType<typeof VList>>()
const isAtBottom = ref(false)

// 监听消息变化,自动滚动到底部
watch(
  () => props.messages[msgLength.value]?.content,
  () => {
    if (listRef.value) {
      nextTick(() => {
        listRef.value.scrollToIndex(props.messages.length - 1, {
          align: 'end',
        })
      })
    }
  },
)
defineExpose({
  scrollToBottom: () => {
    listRef.value?.scrollToIndex(props.messages.length - 1, { align: 'end' })
  },
})

// 添加滚动处理函数
const handleScroll = () => {
  const { scrollOffset, viewportSize, scrollSize } = listRef.value
  if (scrollOffset + viewportSize >= scrollSize) {
    isAtBottom.value = true
  } else {
    isAtBottom.value = false
  }
}
</script>

<template>
  <div class="h-full relative">
    <VList ref="listRef" v-slot="{ item, index }" :data="messages" class="h-full" @scroll="handleScroll">
      <div class="w-full mx-auto max-w-3xl px-4 mb-6">
        <ChatItem.User v-if="item?.role === 'user'" :item="item" />
        <ChatItem.AI
          v-else-if="item?.role === 'assistant'"
          :item="item"
          :loading="ChatLoadingDots"
          :need-refresh="isLastMessageAssistant && msgLength === index"
          :show-action-always="isLastMessageAssistant && msgLength === index"
          @regenerate-message="emit('regenerateMessage', { index })"
          @click-suggest="emit('click-suggest', $event)"
        />
        <div v-if="index === msgLength" class="shrink-0 min-w-[24px] min-h-[24px]"></div>
      </div>
    </VList>
    <FloatButton v-show="!isAtBottom" @click="listRef?.scrollToIndex(messages.length - 1, { align: 'end' })" />
  </div>
</template>

<style lang="scss" scoped></style>
