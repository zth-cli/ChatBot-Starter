import { SuggestMessage } from './SuggestMessage'
import { RenderMarkdown } from '@/components/RenderMarkdown'
import { Separator } from '@/components/ui/separator'
import { useChatStore } from '@/store'
import { CopyX, MoreActions, Refresh, MoreActionItem } from './ActionBar'
import { cn } from '@/lib'
import { ThumbsUpOrDown } from './ThumbsUpOrDown'
import { ChatMessage, MessageStatus } from '@/chatbot/main/types'

export const AIChatItem = defineComponent({
  name: 'AIChatItem',
  props: {
    item: {
      type: Object as PropType<ChatMessage>,
      required: true,
    },
    loading: {
      type: Object as PropType<Component>,
    },
    render: {
      type: Function as unknown as PropType<() => VNode | null>,
      required: false,
    },
    needRefresh: {
      type: Boolean,
      default: false,
    },
    // 是否显示推荐问题
    showSuggest: {
      type: Boolean,
      default: true,
    },
    // 操作栏是否常驻
    showActionAlways: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['refresh', 'click-suggest'],
  setup(props, { emit }) {
    // 是否是插件类型
    const isPlugin = computed(() => props.item?.toolCalls?.length > 0)
    // 当content为空且status为3 ，显示loading
    const isPendding = computed(() => props.item.status === MessageStatus.PENDING)
    const isLoading = computed(() => props.item.status === MessageStatus.STREAMING)
    const handleSelect = (item: MoreActionItem) => {
      switch (item.value) {
        case 'copy':
          break
        case 'regenerate':
          break
        case 'delete':
          useChatStore().removeChatMessageById(props.item.id)
          break
      }
    }
    return () => (
      <div class='w-full flex flex-col items-start group gap-2'>
        {props.render?.()}
        {isPlugin.value && <p>插件</p>}
        {props.item.content && (
          <RenderMarkdown class='w-full' data={props.item.content} loading={isLoading.value} id={props.item.id} />
          // <div>{props.item.content}</div>
        )}
        {isPendding.value && props.loading && h(props.loading)}
        {/* 操作 */}
        <div
          v-show={!isLoading.value}
          class={cn(
            'text-xs text-black/50 dark:text-foreground',
            !props.showActionAlways ? 'opacity-0 group-hover:opacity-100' : 'opacity-100',
          )}>
          <div class='rounded flex gap-4 items-center cursor-pointer mt-2'>
            {props.needRefresh && <Refresh item={props.item} onClick={() => emit('refresh')} />}
            <CopyX id={props.item.id} />
            <MoreActions item={props.item} onSelect={(item: MoreActionItem) => handleSelect(item)} />
            <Separator orientation='vertical' class='h-3' />
            <ThumbsUpOrDown message={props.item} />
          </div>
        </div>
        {/* 推荐问题 */}
        {props.showSuggest && (
          <SuggestMessage
            list={props.item.suggestMessage}
            onClickSuggest={(item: string) => emit('click-suggest', item)}
          />
        )}
      </div>
    )
  },
})
