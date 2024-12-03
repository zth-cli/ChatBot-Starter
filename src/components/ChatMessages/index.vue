<script setup lang="ts">
import ChatLoadingDots from '@/components/ChatLoadingDots/index.vue'
import { ChatMessage } from '@/chatbot/main/types'
import ChatItem from '@/components/ChatItem'
import { VList } from 'virtua/vue'

defineOptions({ name: 'ChatMessages' })
const props = defineProps<{
  messages: ChatMessage[]
  isAtBottom: boolean
}>()

const emit = defineEmits<{
  refresh: [params: { index: number }]
  'click-suggest': [item: string]
}>()

const msgLength = computed(() => props.messages.length - 1)
const isLastMessageAssistant = computed(() => {
  if (props.messages.length === 0) return false
  return props.messages[msgLength.value].role === 'assistant'
})

// 滚动相关逻辑
const listRef = ref<InstanceType<typeof VList>>()

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
</script>

<template>
  <VList ref="listRef" v-slot="{ item, index }" :data="messages" :style="{ height: '100%' }">
    <div class="w-full mx-auto max-w-3xl px-4 mb-6">
      <ChatItem.User v-if="item?.role === 'user'" :item="item" />
      <ChatItem.AI
        v-else-if="item?.role === 'assistant'"
        :item="item"
        :loading="ChatLoadingDots"
        :need-refresh="isLastMessageAssistant && msgLength === index"
        :show-action-always="isLastMessageAssistant && msgLength === index"
        @refresh="emit('refresh', { index })"
        @click-suggest="emit('click-suggest', $event)"
      />
      <div v-if="index === msgLength" class="shrink-0 min-w-[24px] min-h-[24px]"></div>
    </div>
  </VList>
</template>

<style lang="scss" scoped></style>
