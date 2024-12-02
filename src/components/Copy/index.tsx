import { cn } from '@/lib'
import { useClipboard } from '@vueuse/core'
import { Clipboard, ClipboardCheck } from 'lucide-vue-next'
export const Copy = defineComponent({
  name: 'Copy',
  props: {
    content: {
      type: String,
      required: true,
    },
    copyHandle: {
      type: Function as PropType<(text: string) => Promise<string> | string>,
    },
    showText: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const { copy, copied, isSupported } = useClipboard({
      source: props?.content,
      legacy: true,
    })
    /**
     * @description 文本复制
     */
    const coptHandle = async () => {
      if (props.copyHandle) {
        const text = await props.copyHandle(props.content)
        await copy(text)
      } else {
        await copy(props.content)
      }
    }
    const CopyRef = computed(() => (copied.value ? ClipboardCheck : Clipboard))
    return () => (
      <>
        {isSupported.value && (
          <div onClick={coptHandle} class={'flex items-center cursor-pointer'}>
            <CopyRef.value class={cn('h-4 w-4', copied.value && 'stroke-primary')} />
            {props.showText && <span class='ml-2 text-sm'>{copied.value ? '成功' : '复制'}</span>}
          </div>
        )}
      </>
    )
  },
})
