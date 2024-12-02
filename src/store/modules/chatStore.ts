import { defineStore } from 'pinia'
import { useChatDB } from '@/store'
import { useDebounceFn } from '@vueuse/core'
import { ChatHistory, ChatMessage } from '@/chatbot/main/types'

export const CHAT_KEY = 'chat-history-list1'
/**
 * @description 聊天消息存储
 */
export const useChatStore = defineStore('chat', () => {
  const chatDB = useChatDB()

  const route = useRoute()

  const chatHistoryList = ref<ChatHistory[]>([])
  // 当前历史对话
  const currentChatHistory = ref<ChatHistory | null>(null)
  // 当前对话id
  const currentChatId = computed(() => currentChatHistory.value?.id)
  // 当前对话
  const currentChatMessages = ref<ChatMessage[]>([])

  // chatDB.set(CHAT_KEY, [
  //   {
  //     id: '1243d12ew1s12321ww12w',
  //     name: '如何在人工智能领域制定职业规划',
  //     children: [
  //       { content: '你好', role: 'user' },
  //       { content: '你好, 我是小智', role: 'assistant' },
  //     ],
  //     userId: 1,
  //     createTime: new Date().toString(),
  //     updateTime: new Date().toString(),
  //     isFavorite: false,
  //   },
  // ])
  // 获取对话列表
  const getChatHistoryList = async () => {
    try {
      const res = await chatDB.get<ChatHistory[]>(CHAT_KEY)
      chatHistoryList.value = res || []
      // 页面重载时，根据query.id初始化
      if (route.query.id) {
        getChatHistoryById(route.query.id as string)
      }
    } catch (error) {
      console.error('获取对话列表失败:', error)
      chatHistoryList.value = []
    }
  }
  const init = async () => {
    await getChatHistoryList()
  }
  // 根据id获取对话，同时设置当前会话
  const getChatHistoryById = (id: string) => {
    currentChatHistory.value = chatHistoryList.value.find((item) => item.id === id) || null
    if (currentChatHistory.value) {
      currentChatMessages.value = currentChatHistory.value.children
    }
    return currentChatHistory.value
  }
  // 根据id获取对话，但不设置为当前对话
  const findChatHistoryById = (id: string) => {
    return chatHistoryList.value.find((item) => item.id === id) || null
  }
  const createDefaultChatHistory = (): ChatHistory => ({
    id: crypto.randomUUID(),
    name: '新对话',
    createTime: new Date().toISOString(), // 使用ISO格式时间
    updateTime: new Date().toISOString(),
    userId: '1',
    isFavorite: false,
    isTemp: true,
    loading: false,
    children: [],
  })

  // 插入一个新的对话，同时设置当前会话
  const insertNewChatHistory = () => {
    currentChatHistory.value = createDefaultChatHistory()
    currentChatMessages.value = currentChatHistory.value.children
    chatHistoryList.value.unshift(currentChatHistory.value) // 新对话插入到开头
  }
  // 插入消息
  const insertChatMessage = (message: ChatMessage) => {
    currentChatMessages.value.push(message)
  }

  // 重置
  const resetChat = () => {
    currentChatMessages.value = []
    currentChatHistory.value = null
  }

  // 存储对话
  const saveChatHistory = async (messages: ChatHistory[]) => {
    try {
      await chatDB.set(CHAT_KEY, messages)
    } catch (error) {
      console.error('保存对话失败:', error)
    }
  }
  // 删除对话
  const deleteChatHistory = (id: string, cb?: () => void) => {
    chatHistoryList.value = chatHistoryList.value.filter((item) => item.id !== id)
    // 如果删除的是当前对话，则重置
    if (currentChatHistory.value?.id === id) {
      resetChat()
    }
    cb?.()
  }

  // 更新当前消息
  const updateCurrentChatMessage = (message: ChatMessage) => {
    const index = currentChatMessages.value.findIndex((item) => item.id === message.id)
    if (index !== -1) {
      currentChatMessages.value[index] = { ...currentChatMessages.value[index], ...message }
    }
  }

  // 根据id移除currentChatMessages的某条消息
  const removeChatMessageById = (id: string) => {
    try {
      const index = currentChatMessages.value.findIndex((item) => item.id === id)
      if (index !== -1) {
        currentChatMessages.value.splice(index, 1)
      } else {
        console.warn(`未找到ID为${id}的消息`)
      }
    } catch (error) {
      console.error('删除消息失败:', error)
    }
  }

  // 当对话更新时，更新数据库
  const debouncedSave = useDebounceFn((list: ChatHistory[]) => {
    saveChatHistory(JSON.parse(JSON.stringify(list)))
  }, 1000)
  watch(
    () => currentChatHistory.value,
    () => {
      debouncedSave(chatHistoryList.value)
    },
    { deep: true },
  )

  return {
    init,
    chatHistoryList,
    currentChatHistory,
    currentChatId,
    currentChatMessages,
    resetChat,
    insertNewChatHistory,
    insertChatMessage,
    saveChatHistory,
    getChatHistoryList,
    deleteChatHistory,
    getChatHistoryById,
    removeChatMessageById,
    findChatHistoryById,
    updateCurrentChatMessage,
  }
})
