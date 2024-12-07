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
  emits: ['regenerate-message', 'click-suggest'],
  setup(props, { emit }) {
    // 是否是插件类型
    const isPlugin = computed(() => Boolean(props.item?.toolCalls?.type))
    // 当content为空且status为3 ，显示loading
    const isPending = computed(() => props.item.status === MessageStatus.PENDING)
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
    const renderActions = () => (
      <div
        v-show={!isLoading.value}
        class={cn(
          'text-xs text-black/50 dark:text-foreground',
          !props.showActionAlways ? 'opacity-0 group-hover/ai:opacity-100' : 'opacity-100',
        )}>
        <div class='rounded flex gap-4 items-center cursor-pointer mt-2'>
          {props.needRefresh && <Refresh item={props.item} onClick={() => emit('regenerate-message')} />}
          <CopyX id={props.item.id} />
          <MoreActions item={props.item} onSelect={handleSelect} />
          <Separator orientation='vertical' class='h-3' />
          <ThumbsUpOrDown message={props.item} />
        </div>
      </div>
    )

    return () => (
      <div class='w-full flex flex-col items-start group/ai gap-2'>
        {props.render?.()}
        {isPlugin.value && <p>插件</p>}
        {props.item.content ? (
          <RenderMarkdown class='w-full' data={props.item.content} loading={isLoading.value} id={props.item.id} />
        ) : (
          <span class='text-sm text-black/50 dark:text-foreground'></span>
        )}
        {isPending.value && props.loading && h(props.loading)}
        {/* 操作 */}
        {renderActions()}
        {/* 推荐问题 */}
        {props.showSuggest && (
          <SuggestMessage
            list={props.item.suggestMessage?.data}
            loading={props.item.suggestMessage?.loading ? props.loading : undefined}
            onClickSuggest={(item: string) => emit('click-suggest', item)}
          />
        )}
      </div>
    )
  },
})
