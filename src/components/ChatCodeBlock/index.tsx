import { defineComponent, PropType, ref, onMounted } from 'vue'
import { initHighlighter } from '@/lib/singletonShiki'
import { Skeleton } from '@/components/ui/skeleton'
import { Copy } from '@/components/Copy'
import './style.scss'
import { SquareTerminal, ChevronDown, ChevronUp } from 'lucide-vue-next'

export const CodeBlock = defineComponent({
  name: 'CodeBlock',
  props: {
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String as PropType<string | null>,
      default: null,
    },
  },
  setup(props) {
    const highlightedCode = ref('')
    const isExpanded = ref(true)
    const highlightedCodeRef = ref<HTMLElement | null>(null)
    const isLoading = ref(true)

    const highlightCode = async () => {
      try {
        isLoading.value = true
        const highlighter = await initHighlighter()
        const theme = isDark.value ? 'github-dark' : 'github-light'

        if (props.language) {
          highlightedCode.value = highlighter.codeToHtml(props.code, {
            lang: props.language,
            theme,
          })
        } else {
          highlightedCode.value = highlighter.codeToHtml(props.code, {
            lang: 'bash',
            theme,
          })
        }
      } catch (err) {
        console.error('Failed to highlight:', err)
        highlightedCode.value = props.code
      } finally {
        isLoading.value = false
      }
    }

    watch(
      () => props.code,
      () => {
        highlightCode()
      },
      {
        immediate: true,
      },
    )

    const toggleExpand = () => {
      isExpanded.value = !isExpanded.value
    }
    watch(
      () => isDark.value,
      () => {
        highlightCode()
      },
    )

    return () => (
      <>
        <div
          class='border rounded-lg inline-block px-2 leading-7 text-sm cursor-pointer mt-1 select-none'
          onClick={toggleExpand}>
          {isExpanded.value ? '收起' : '展开'}
          {isExpanded.value ? <ChevronUp class='h-4 w-4 inline ml-1' /> : <ChevronDown class='h-4 w-4 inline ml-1' />}
        </div>
        <div class='code-block-wrapper' style={{ display: isExpanded.value ? 'block' : 'none' }}>
          <div class='code-block-header'>
            <span class='language-label'>
              <SquareTerminal class='h-4 w-4 mr-1' />
              {props.language ?? ''}
            </span>
            <Copy content={props.code} showText={true} />
          </div>
          {isLoading.value && (
            <div class='flex items-center space-x-4 p-4'>
              <div class='space-y-2'>
                <Skeleton class='h-4 w-[300px]' />
                <Skeleton class='h-4 w-[250px]' />
                <Skeleton class='h-4 w-[200px]' />
              </div>
            </div>
          )}
          <pre class={['code-block', { hidden: isLoading.value }]}>
            <code
              v-html={highlightedCode.value}
              ref={highlightedCodeRef}
              class={props.language ? `language-${props.language}` : ''}
            />
          </pre>
        </div>
      </>
    )
  },
})
