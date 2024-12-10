<script setup lang="ts">
import { ChevronLeft } from 'lucide-vue-next'
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
    <div
      :class="isWorkspace ? 'flex-1 flex flex-col h-full bg-muted overflow-y-auto transition-all duration-200' : 'w-0'"
    >
      <div class="h-12 px-2 flex items-center bg-background border-b">
        <Button variant="ghost" size="icon" @click="isWorkspace = false">
          <ChevronLeft class-name="!size-5" />
        </Button>
      </div>
      <div class="flex-1 overflow-y-auto">
        <slot name="workspace" />
      </div>
    </div>
    <div v-show="showChat" :class="cn('h-full bg-background', isWorkspace ? 'w-[min(450px,100%)]' : 'w-full')">
      <slot />
    </div>
  </div>
</template>
