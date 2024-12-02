<script setup lang="ts">
import { cn } from '@/lib'

defineOptions({
  name: 'ChatContainer',
})

const { md } = useResponsive()
const isWorkspace = defineModel<boolean>({ required: false })
const showChat = computed(() => !md.value || !isWorkspace.value)
</script>

<template>
  <div class="flex w-full h-full">
    <div :class="isWorkspace ? 'flex-1 h-full bg-muted overflow-y-auto transition-all duration-200' : 'w-0'">
      <slot name="workspace" />
    </div>
    <div v-show="showChat" :class="cn('h-full bg-background', isWorkspace ? 'w-[min(450px,100%)]' : 'w-full')">
      <slot />
    </div>
  </div>
</template>
