import { SuggestMessageItem } from './item'

export const SuggestMessage = defineComponent({
  name: 'SuggestMessage',
  props: {
    loading: {
      type: Object as PropType<Component>,
    },
    list: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
  },
  emits: ['click-suggest'],
  setup(props, { attrs, emit }) {
    return () => (
      <div class='flex flex-col gap-2 w-full mt-6'>
        {props.loading && h(props.loading)}
        {props.list.map((item) => (
          <SuggestMessageItem content={item} {...attrs} onClick={() => emit('click-suggest', item)} />
        ))}
      </div>
    )
  },
})
