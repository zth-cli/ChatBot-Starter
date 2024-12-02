import { cn } from '@/lib'
import { ThumbsDown, ThumbsUp } from 'lucide-vue-next'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ChatMessage } from '@/chatbot/main/types'

export const ThumbsUpOrDown = defineComponent({
  name: 'ThumbsUpOrDown',
  props: {
    message: {
      type: Object as PropType<ChatMessage>,
      required: true,
    },
  },
  setup(props) {
    const status = computed(() => props.message.likeStatus)
    const handleClick = (status: 1 | -1) => {
      // 利用引用修改父组件的值, 如果值相同则设置未0
      props.message.likeStatus = status === props.message.likeStatus ? 0 : status
    }
    return () => (
      <>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as-child class='outline-none'>
              <ThumbsUp class={cn('w-4 h-4', status.value === 1 && 'text-primary')} onClick={() => handleClick(1)} />
            </TooltipTrigger>
            <TooltipContent>
              <p>喜欢</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as-child class='outline-none'>
              <ThumbsDown
                class={cn('w-4 h-4', status.value === -1 && 'text-primary')}
                onClick={() => handleClick(-1)}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>不喜欢</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </>
    )
  },
})
