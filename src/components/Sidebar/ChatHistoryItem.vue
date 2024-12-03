<template>
  <div
    :class="[
      cn(
        buttonVariants({ variant: 'ghost' }),
        'justify-start rounded-xl border-none cursor-pointer',
        '!h-8 hover:bg-gray-200/60 dark:hover:bg-neutral-800',
        'group text-gray-500 hover:text-gray-500',
        'flex items-center',
      ),
    ]"
  >
    <MessageSquareIcon class="mr-2 h-4 w-4" />
    <span class="truncate flex-1 text-left mr-2">{{ item?.name }}</span>
    <div class="flex-shrink-0 size-4 opacity-0 group-hover:opacity-100 transition-opacity">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'
import { MessageSquareIcon } from 'lucide-vue-next'
import { buttonVariants } from '@/components/ui/button'
import { ChatHistory } from '@/chatbot/main/types'

defineOptions({
  name: 'ChatHistoryItem',
})

defineProps<{
  item: ChatHistory
}>()
</script>
