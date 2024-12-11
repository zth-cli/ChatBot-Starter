<script setup lang="ts">
import { ref, computed } from 'vue'
import './style.scss'
import { useLastTextPosition } from '@/composables/useLastPosition'
import { useMarkdownRenderer } from '@/composables/useMarkdownRenderer'
import { CodeBlock } from '@/components/ChatCodeBlock'

interface Props {
  markdown: string
  loading: boolean
  id?: string
}

const props = defineProps<Props>()
const containerRef = ref<HTMLDivElement | null>(null)
const { md } = useMarkdownRenderer()
const { position } = useLastTextPosition(containerRef)

const parsedContent = computed(() => {
  const parsed = md.value.render(props.markdown)
  return parsed
    .split(/(<CodeBlock-.*?>)/)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith('<CodeBlock-')) {
        const match = part.match(/<CodeBlock-(.*?)-(.*)>/)
        if (!match) {
          console.warn('Invalid CodeBlock format:', part)
          return null
        }
        const [, language, encodedCode] = match
        const code = decodeURIComponent(encodedCode)
        return {
          type: 'code-block',
          props: {
            language,
            code,
            key: index,
          },
        }
      }
      return {
        type: 'html',
        content: part,
        key: index,
      }
    })
    .filter(Boolean)
})
</script>

<template>
  <div class="relative transition-all duration-300">
    <div
      ref="containerRef"
      class="md_container text-black/85 dark:text-foreground text-sm sm:text-base tracking-wide leading-normal sm:leading-7"
    >
      <template v-for="item in parsedContent" :key="item.key">
        <CodeBlock v-if="item.type === 'code-block'" :language="item.props.language" :code="item.props.code" />
        <span v-else v-html="item.content" />
      </template>
    </div>

    <span
      v-if="loading"
      class="absolute h-2 w-2 rounded-full animate-pulse-dark-light"
      :style="{
        top: `${(position?.y || 0) + 6}px`,
        left: `${position?.x || 0}px`,
      }"
    />
  </div>
</template>
