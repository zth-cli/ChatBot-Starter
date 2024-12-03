import { SuggestMessageItem } from './item'

export const SuggestMessage = defineComponent({
  name: 'SuggestMessage',
  props: {
    list: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
  },
  emits: ['click-suggest'],
  setup(props, { attrs, emit }) {
    return () => (
      <>
        {props.list.length > 0 && (
          <div class='flex flex-col gap-2 w-full mt-6'>
            {props.list.map((item) => (
              <SuggestMessageItem content={item} {...attrs} onClick={() => emit('click-suggest', item)} />
            ))}
          </div>
        )}
      </>
    )
  },
})
