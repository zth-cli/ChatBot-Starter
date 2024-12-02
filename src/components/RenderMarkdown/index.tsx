import './style.scss'
import { ref, watchEffect, defineComponent, PropType } from 'vue'
import { useLastTextPosition } from '@/composables/useLastPosition'
import { useTextSelection } from '@/composables/useTextSelection'
import { useCodeBlockMount } from '@/composables/useCodeBlockMount'
import { useMarkdownRenderer } from '@/composables/useMarkdownRenderer'

export const RenderMarkdown = defineComponent({
  name: 'RenderMarkdown',
  props: {
    id: {
      type: String,
      default: '',
    },
    unstyle: {
      type: Boolean,
      default: false,
    },
    data: {
      type: [String, Object] as PropType<any | undefined>,
      default: '',
    },
    maxHeight: {
      type: Number,
      default: 0,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { expose }) {
    const containerRef = ref<HTMLElement | null>(null)

    const isExpanded = ref(false)
    const hasOverflow = ref(false)
    const { md } = useMarkdownRenderer()
    // 文本选择
    const { getSelectionInfo, setSelectionByInfo } = useTextSelection(containerRef)
    // 挂载渲染code
    const { mountCodeBlocks } = useCodeBlockMount(containerRef)
    let lastContent = ''

    const updateContent = async () => {
      if (!containerRef.value) {
        return
      }
      const selectionInfo = getSelectionInfo()

      if (props.unstyle) {
        if (lastContent !== props.data) {
          containerRef.value.textContent = props.data
          lastContent = props.data
        }
      } else {
        if (typeof props.data !== 'string') {
          containerRef.value.innerHTML = JSON.stringify(props.data, null, 2)
          lastContent = JSON.stringify(props.data)
        } else {
          const html = md.value.render(props.data)
          if (lastContent !== html) {
            containerRef.value.innerHTML = html
            lastContent = html
            mountCodeBlocks()
          }
        }
      }

      if (selectionInfo) {
        setSelectionByInfo(selectionInfo)
      }

      if (props.maxHeight && containerRef.value) {
        hasOverflow.value = containerRef.value.scrollHeight > props.maxHeight
      }
    }

    watchEffect(updateContent)

    const { position } = useLastTextPosition(containerRef)
    expose({
      containerRef,
    })

    return () => (
      <div class='relative'>
        <div class='relative'>
          <div
            ref={containerRef}
            id={`md_container_${props.id}`}
            class='md_container text-black/85 dark:text-foreground text-sm sm:text-base tracking-wide leading-normal sm:leading-7'
            style={[
              props.unstyle ? 'white-space: pre-wrap; word-wrap: break-word;' : '',
              props.maxHeight && !isExpanded.value ? `max-height: ${props.maxHeight}px; overflow: hidden;` : '',
            ].join(' ')}></div>
          {props.loading && (
            <span
              class='absolute h-2 w-2 rounded-full animate-pulse-dark-light'
              style={{ top: (position.value?.y + 6 || 0) + 'px', left: (position.value?.x || 0) + 'px' }}></span>
          )}
        </div>

        {hasOverflow.value && !isExpanded.value && (
          <div class='absolute bottom-[30px] left-0 w-full h-[4em] bg-gradient-to-b from-transparent to-background pointer-events-none' />
        )}
        {hasOverflow.value && (
          <div class='text-center mt-2'>
            <button class='text-primary hover:text-primary/80' onClick={() => (isExpanded.value = !isExpanded.value)}>
              {isExpanded.value ? '收起' : '展开更多'}
            </button>
          </div>
        )}
      </div>
    )
  },
})
