import { cn } from '@/lib/utils'
import { useChatStore } from '@/store'
import { FileTags } from './FileTags'
import { Del } from './ActionBar'
import { Copy } from '@/components/Copy'
import { ChatMessage } from '@/chatbot/main/types'
export const UserChatItem = defineComponent({
  name: 'UserChatItem',
  props: {
    item: {
      type: Object as PropType<ChatMessage>,
      required: true,
    },
  },
  setup(props) {
    return () => (
      <div class='w-full flex flex-col items-end group/chat'>
        <div class='flex items-center h-fit relative'>
          <div class='flex flex-col items-end'>
            {/* 附件显示 */}
            {props.item.attachments?.length > 0 && <FileTags attachments={props.item.attachments} />}
            <div
              class={cn(
                'text-sm sm:text-base',
                'px-4 py-2 rounded-xl',
                'bg-primary text-primary-foreground',
                'break-words whitespace-pre-wrap',
                'max-w-[300px] md:max-w-[450px]',
                'text-white/90',
              )}>
              {props.item.content}
            </div>
          </div>
        </div>
        <div class='text-xs opacity-0 group-hover/chat:opacity-100  text-black/50 dark:text-foreground'>
          <div
            class={cn('rounded flex gap-2 items-center cursor-pointer mt-2 opacity-0 group-hover/chat:opacity-100 ')}>
            <Copy content={props.item.content} />
            <Del item={props.item} onClick={() => useChatStore().removeChatMessageById(props.item.id)} />
          </div>
        </div>
      </div>
    )
  },
})
