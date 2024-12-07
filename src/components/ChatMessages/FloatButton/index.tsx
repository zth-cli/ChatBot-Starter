import { Button } from '@/components/ui/button'
import { ArrowDown } from 'lucide-vue-next'

export const FloatButton = defineComponent({
  name: 'FloatButton',
  props: {
    title: {
      type: String,
      default: '回到顶部',
      required: false,
    },
  },
  setup(_, { slots, attrs }) {
    return () => (
      <Button
        {...attrs}
        variant='outline'
        size='icon'
        class='absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full shadow-md'>
        {slots?.default ? slots?.default() : <ArrowDown class='w-5 h-5 stroke-primary' />}
      </Button>
    )
  },
})
