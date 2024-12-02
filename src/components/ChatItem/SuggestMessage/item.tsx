import { cn } from '@/lib'
import { ArrowRight } from 'lucide-vue-next'

export const SuggestMessageItem = defineComponent({
  name: 'SuggestMessageItem',
  props: {
    content: {
      type: String as PropType<string>,
      required: true,
    },
  },
  setup(props, { attrs }) {
    return () => (
      <div
        {...attrs}
        class={cn(
          'bg-black/5 dark:bg-neutral-900',
          'hover:bg-black/10 dark:hover:bg-neutral-800',
          'text-black/85 dark:text-foreground',
          'flex items-center h-fit gap-1 w-fit',
          'rounded-xl py-2 pl-4 pr-[10px] cursor-pointer',
        )}>
        <span class='text-sm flex-1'>{props.content}</span>
        <ArrowRight class='w-4 h-4' />
      </div>
    )
  },
})
