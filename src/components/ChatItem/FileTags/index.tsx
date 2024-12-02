import { cn } from '@/lib'
import { TagItem } from './TagItem'
import { UploadFileInfo } from '@/chatbot/main/types'

export const FileTags = defineComponent({
  name: 'FileTags',
  props: {
    attachments: {
      type: Array as PropType<(UploadFileInfo & { size?: number })[]>,
      default: () => [],
    },
  },
  setup(props) {
    return () => (
      <div
        class={cn(
          'relative grid gap-x-2 gap-y-2 max-w-full mb-2',
          props.attachments?.length < 3
            ? `grid-cols-${props.attachments?.length}`
            : 'lg:grid-cols-3 md:grid-cols-2 grid-cols-1',
        )}>
        {props.attachments?.map((item) => {
          return <TagItem fileInfo={item} showClose={false} />
        })}
      </div>
    )
  },
})
