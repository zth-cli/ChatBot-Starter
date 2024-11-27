<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { ScrollAreaCorner, ScrollAreaRoot, type ScrollAreaRootProps, ScrollAreaViewport } from 'radix-vue'
import ScrollBar from './ScrollBar.vue'
import { cn } from '@/lib/utils'

const props = defineProps<ScrollAreaRootProps & { class?: HTMLAttributes['class'] }>()
const emit = defineEmits(['load'])

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const scrollRef = ref<HTMLElement | null>(null)

defineExpose({
  scrollRef,
})
onMounted(() => {
  const viewportElement = document.querySelector('[data-scroll-area="viewport"]')
  emit('load', viewportElement)
})
</script>

<template>
  <ScrollAreaRoot v-bind="delegatedProps" :class="cn('relative overflow-hidden', props.class)">
    <ScrollAreaViewport ref="scrollRef" class="h-full w-full rounded-[inherit]" data-scroll-area="viewport">
      <slot />
    </ScrollAreaViewport>
    <ScrollBar />
    <ScrollAreaCorner />
  </ScrollAreaRoot>
</template>
