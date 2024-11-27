import { CHAT_PROVIDER } from './contants'
import { useScroll } from '@/hooks/useScroll'
import { useChat } from '@/hooks/useChat'
import { v4 as uuidv4 } from 'uuid'
import { ChatStore } from '@/store'
import { storeToRefs } from 'pinia'
import { ChatProvide } from './types'
import { ImageMimeTypes, MimeType } from '@/contants/mimeTypes'
import { fileToBase64, isFileOrBlobInstance } from '@/lib'

export const ChatProvider = defineComponent({
  name: 'ChatProvider',
  setup(_, { slots }) {
    const message = ref('')
    const { scrollRef, isAtBottom, scrollToBottom } = useScroll()
    const chatStore = ChatStore()
    const { currentChatMessages, currentChatHistory } = storeToRefs(chatStore)

    const isNewChat = computed(() => !currentChatHistory.value)
    const { sendMessage, stopStream } = useChat({ message, scrollToBottom })

    const addUserMessage: ChatProvide['addUserMessage'] = async (params) => {
      if (!params.msg) return
      const files = await handleFile(params.attachments || [])
      const message: IChatMessage[] = [
        {
          id: uuidv4(),
          role: 'user',
          content: params.msg,
          date: new Date().toString(),
          attachments: files,
        },
      ]
      currentChatMessages.value.push(...message)
      return message[0]
    }
    const addTipsMessage = (msg: string) => {
      console.log(msg)
    }
    const addAIMessage: ChatProvide['addAIMessage'] = (content?: string) => {
      const message: IChatMessage[] = [
        {
          id: uuidv4(),
          role: 'assistant',
          content,
          date: new Date().toString(),
          state: 2,
        },
      ]
      currentChatMessages.value.push(...message)
    }
    const deleteUnFavorite = () => {
      console.log('deleteUnFavorite')
    }
    const sendChatMessage: ChatProvide['sendChatMessage'] = async (params) => {
      if (isNewChat.value) {
        chatStore.insertNewChatHistory()
      }
      const userMessage = await addUserMessage({
        msg: message.value,
        attachments: params?.attachments,
      })
      // addAIMessage()
      scrollToBottom()
      sendMessage({ index: params?.index, message: message.value })
      message.value = ''
      params?.cb?.(userMessage)
    }
    const cancleStream = () => {
      console.log('cancleStream')
    }
    /**
     * @description 处理附件信息, 如果是图片类型直接base64存储, 否则只存储文件基本信息
     */
    const handleFile = async (files: UploadFileInfo[]) => {
      const filesList = []
      for await (const item of files) {
        const info = {
          file: '',
          name: item.name,
          size: item.file?.size,
          type: item.type,
        }
        if (ImageMimeTypes.includes(item.type as MimeType)) {
          if (isFileOrBlobInstance(item.file)) {
            info.file = await fileToBase64(item.file) // 如果是图片资源直接存储文件
          }
        }
        filesList.push(info)
      }
      return filesList
    }
    provide<ChatProvide>(CHAT_PROVIDER, {
      message,
      scrollRef,
      isAtBottom,
      stopStream,
      scrollToBottom,
      addUserMessage,
      addTipsMessage,
      addAIMessage,
      deleteUnFavorite,
      sendChatMessage,
      cancleStream,
    })
    return () => <>{slots.default?.()}</>
  },
})
