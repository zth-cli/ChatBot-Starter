import { Copy } from '@/components/Copy'

export const CopyX = defineComponent({
  name: 'Copyx',
  props: {
    id: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const handleCopy = (content: string) => {
      const container = document.getElementById(`md_container_${props.id}`)
      return container.textContent
    }

    return () => <Copy content={''} copyHandle={handleCopy} />
  },
})
