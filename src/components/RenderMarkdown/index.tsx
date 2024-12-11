import { defineComponent, ref, computed } from 'vue'
import './style.scss'
import { useLastTextPosition } from '@/composables/useLastPosition'
import { useMarkdownRenderer } from '@/composables/useMarkdownRenderer'
import { CodeBlock } from '@/components/ChatCodeBlock'

interface Props {
  markdown: string
  loading: boolean
  id?: string
}

export const RenderMarkdown = defineComponent({
  name: 'RenderMarkdown',
  props: {
    markdown: {
      type: String,
      required: true,
    },
    loading: {
      type: Boolean,
      required: true,
    },
    id: String,
  },
  setup(props: Props) {
    const containerRef = ref<HTMLDivElement | null>(null)
    const id = useId()
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
            return <CodeBlock key={id} language={language} code={code} />
          }
          return <span key={index} innerHTML={part} />
        })
        .filter(Boolean)
    })

    return () => (
      <div class='relative'>
        <div
          ref={containerRef}
          class='md_container text-black/85 dark:text-foreground text-sm sm:text-base tracking-wide leading-normal sm:leading-7'>
          {parsedContent.value}
        </div>
        {props.loading && (
          <span
            class='absolute h-2 w-2 rounded-full animate-pulse-dark-light'
            style={{
              top: `${(position?.value?.y || 0) + 6}px`,
              left: `${position?.value?.x || 0}px`,
            }}
          />
        )}
      </div>
    )
  },
})
