import { Fn } from '@vueuse/core'

export type ChatProvide = {
  message: Ref<string>
  scrollRef: Ref<any>
  isAtBottom: Ref<boolean>
  addUserMessage: (params: {
    topicName?: string
    msg: string
    attachments?: UploadFileInfo[]
  }) => Promise<IChatMessage | undefined>
  addTipsMessage: (msg: string) => void
  addAIMessage: Fn
  deleteUnFavorite: Fn
  scrollToBottom: (isUserScrolled?: boolean, behavior?: ScrollBehavior | undefined) => void
  sendChatMessage: (params?: {
    topicName?: string
    attachments?: UploadFileInfo[]
    index?: number
    cb?: (any?: IChatMessage) => void
  }) => void
  cancleStream: Fn
  stopStream: Fn
}

export type ChatParams = {
  /**
   * @description 当前输入的内容
   */
  message: Ref<string>

  /**
   * @description 滚动到底部
   */
  scrollToBottom: () => void
}

export type ChatHookParams = { index?: number; controller?: AbortController; loacl?: boolean; message?: string }

export type ChatHook = {
  /**
   * @description 发送消息
   */
  sendMessage: (params?: ChatHookParams) => void
  /**
   * @description 停止流
   */
  stopStream: (params?: any) => void
  /**
   * @description 清理会话
   */
  cleanupSession: (params?: any) => void
  /**
   * @description 当前会话状态
   */
  getSessionStatus: () => {
    activeSessions: number
    maxSessions: number
    canStartNew: boolean
  }
  name: string
}
export type ChatHookFn = (params: ChatParams) => ChatHook
