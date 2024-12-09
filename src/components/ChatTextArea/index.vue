<script setup lang="ts">
import { StopIcon } from './StopIcon'
defineOptions({ name: 'ChatTextArea' })

import { Box, Paperclip, Send } from 'lucide-vue-next'

const message = defineModel<string>({ required: true })
const props = defineProps<{
  loading?: boolean
}>()

const emit = defineEmits(['send', 'stop'])
const textareaRef = ref<HTMLTextAreaElement>()
// Enter 发送
onKeyStroke(
  'Enter',
  (e) => {
    if (!textareaRef.value) return
    if (!e.ctrlKey) {
      // 普通 Enter 发送消息
      if (message.value.trim()) {
        emit('send')
        e.preventDefault()
      }
    } else {
      // Ctrl+Enter 插入换行
      const start = textareaRef.value.selectionStart
      const end = textareaRef.value.selectionEnd
      message.value = message.value.substring(0, start) + '\n' + message.value.substring(end)
      // 将光标位置移到换行后
      setTimeout(() => {
        if (textareaRef.value) {
          textareaRef.value.selectionStart = textareaRef.value.selectionEnd = start + 1
        }
      })
      e.preventDefault()
    }
  },
  { target: textareaRef },
)

onMounted(() => {
  if (textareaRef.value) {
    textareaRef.value.focus()
  }
})

const handleSend = () => {
  if (props.loading) {
    emit('stop')
  } else {
    if (!message.value.trim()) return
    emit('send')
  }
}
</script>

<template>
  <div class="relative w-full">
    <div
      class="w-full flex flex-col rounded-xl border shadow-sm overflow-hidden bg-neutral-50 dark:bg-primary-foreground"
    >
      <textarea
        ref="textareaRef"
        v-model="message"
        autofocus
        class="w-full max-h-[160px] min-h-[40px] p-4 border-0 resize-none outline-none bg-transparent placeholder:text-gray-300 text-sm overflow-y-auto"
        placeholder="输入问题"
      />
      <div class="flex items-center gap-1 justify-end pr-2 pb-2">
        <Button variant="ghost" title="工作台" size="icon" class="text-gray-400 hover:text-gray-600">
          <Box class="size-5" />
        </Button>
        <Button variant="ghost" title="附件" size="icon" class="text-gray-400 hover:text-gray-600">
          <Paperclip class="size-5" />
        </Button>
        <Button
          :disabled="!message && !loading"
          variant="ghost"
          title="发送"
          size="icon"
          class="text-gray-400 hover:text-gray-600"
          @click="handleSend"
        >
          <Send v-if="!loading" class="size-5" />
          <StopIcon v-else class="size-9" />
        </Button>
      </div>
    </div>
  </div>
</template>
