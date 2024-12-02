import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { Ellipsis } from 'lucide-vue-next'
import { CopyX, Del, Refresh } from '.'
import { ChatMessage } from '@/chatbot/main/types'
export type MoreActionItem = {
  name: string
  icon: any
  shortcut?: string
  value: string
}
export const MoreActions = defineComponent({
  name: 'MoreActions',
  props: {
    item: {
      type: Object as PropType<ChatMessage>,
      required: true,
    },
    list: {
      type: Array as PropType<MoreActionItem[]>,
      default: () => [
        // {
        //   icon: CopyX,
        //   name: '复制',
        //   value: 'copy',
        // },
        // {
        //   icon: Refresh,
        //   name: '重新生成',
        //   value: 'regenerate',
        // },
        {
          icon: Del,
          name: '删除',
          value: 'delete',
        },
      ],
    },
  },
  emits: ['select'],
  setup(props, { emit }) {
    const handleSelect = (item: MoreActionItem) => {
      emit('select', item)
    }
    return () => (
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Ellipsis class={cn('h-4 w-4')} />
        </DropdownMenuTrigger>
        <DropdownMenuContent class='w-36'>
          <DropdownMenuGroup>
            {props.list.map((item, i) => (
              <DropdownMenuItem key={i} onSelect={() => handleSelect(item)}>
                <item.icon item={props.item} title={item.name} key={item.name} />
                <DropdownMenuShortcut>{item?.shortcut}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          {/* <DropdownMenuSeparator /> */}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
})
