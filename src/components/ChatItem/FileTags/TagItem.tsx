import { MimeType, ImageMimeTypes } from '@/chatbot/constants/mimeTypes'
import { X } from 'lucide-vue-next'
import { cn, isFileOrBlobInstance } from '@/lib'
import { UploadFileInfo } from '@/chatbot/main/types'
export const TagItem = defineComponent({
  name: 'TagItem',
  props: {
    fileInfo: {
      type: Object as PropType<UploadFileInfo & { size?: number }>,
      default: () => ({
        id: '',
        name: '',
        type: '',
        url: '',
        size: 0,
        tags: [],
        file: null,
      }),
    },
    showClose: {
      type: Boolean,
      default: true,
    },
    onClose: {
      type: Function as PropType<($event: any) => void>,
    },
  },
  setup(props) {
    const isImageType = computed(() => {
      return ImageMimeTypes.includes(props.fileInfo.type as MimeType)
    })

    // 获取文件类型
    const getFileType = (file: UploadFileInfo) => {
      const type = file.type?.split('/')[1]
      // 判断docx doc xlsx xls
      switch (type) {
        case 'vnd.ms-excel':
          return 'xlsx'
        case 'vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          return 'xlsx'
        case 'vnd.openxmlformats-officedocument.wordprocessingml.document':
          return 'docx'
        case 'msword':
          return 'docx'
        default:
          return type
      }
    }

    const icon = computed(() => new URL(`./icons/${getFileType(props.fileInfo)}.png`, import.meta.url).href)

    // 文件小于1M, KB为单位
    const fileSize = computed(() => {
      const size = props.fileInfo.file?.size || props.fileInfo?.size || 0
      if (size && size < 1024 * 1024) {
        return `${(size / 1024).toFixed(2)}KB`
      }
      return `${(size / 1024 / 1024).toFixed(2)}MB`
    })

    const handleClose = ($event: any) => {
      props.onClose?.($event)
    }
    const base64Url = ref<string | ArrayBuffer | null>('')
    onMounted(() => {
      if (isImageType.value) {
        if (isFileOrBlobInstance(props.fileInfo.file)) {
          const reader = new FileReader()

          // 当图片读取完成时触发
          reader.onload = (e) => {
            base64Url.value = e.target!.result
          }

          // 将图片读取为 Data URL (包含 base64 编码)
          if (props.fileInfo.file instanceof File) {
            reader.readAsDataURL(props.fileInfo.file)
          }
        } else if (props.fileInfo.file) {
          base64Url.value = props.fileInfo.file
        }
      }
    })
    return () => (
      <div
        class={cn(
          'relative flex items-start gap-2 cursor-pointer bg-black/5 dark:bg-neutral-900 rounded-lg',
          isImageType.value ? 'p-1' : 'p-3 py-2',
        )}>
        {isImageType.value ? (
          <img src={base64Url.value} alt='' class='w-14 aspect-square rounded-lg' />
        ) : (
          <>
            <div class='w-[25px]'>
              <img preview-disabled={true} width='25' src={icon.value} color='transparent' />
            </div>
            <div class={'flex-1 flex flex-col gap-1'}>
              <p class={'line-clamp-1 w-28 sm:w-32 text-xs font-bold'} title={props.fileInfo.name}>
                {props.fileInfo.name}
              </p>
              <p class={'text-xs text-gray-500 dark:text-gray-300'}>
                {getFileType(props.fileInfo)?.toUpperCase()},{fileSize.value}
              </p>
            </div>
          </>
        )}
        {props.showClose && (
          <p onClick={handleClose} class={'absolute right-[-4px] top-[-4px] bg-red-500 rounded-full text-white'}>
            <X class={'w-3 h-3'} />
          </p>
        )}
      </div>
    )
  },
})
