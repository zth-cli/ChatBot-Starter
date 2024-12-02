import { RotateCcw } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { ChatMessage } from '@/chatbot/main/types'
export const Refresh = defineComponent({
  name: 'Refresh',
  props: {
    item: {
      type: Object as PropType<ChatMessage>,
      required: true,
    },
    title: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    return () => (
      <div class={'flex items-center cursor-pointer flex-1'}>
        <RotateCcw class={cn('h-4 w-4', props.item.status === 2 && 'animate-spin')} />
        {props.title && <span class='ml-2'>{props.title}</span>}
      </div>
    )
  },
})
