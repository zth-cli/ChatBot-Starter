export type Role = 'user' | 'assistant' | 'system' | 'tool'

/**
 * @description 历史对话
 */
export interface ChatHistory {
  /**
   * @description: 会话id
   */
  id: string
  /**
   * @description: 是否为临时会话
   */
  isTemp?: boolean
  /**
   * @description: 加载状态
   */
  loading?: boolean
  /**
   * @description: 会话名称
   */
  name: string
  /**
   * @description: 用户标识， 可选
   */
  userId?: string
  /**
   * @description: 会话创建时间
   */
  createTime: string
  /**
   * @description: 会话更新时间
   */
  updateTime: string
  /**
   * @description: 会话消息列表
   */
  children: ChatMessage[]
  /**
   * @description: 是否收藏
   */
  isFavorite?: boolean
}

export interface ChatMessage {
  id: string
  role: Role
  content: string
  status: MessageStatus
  date: string
  toolCalls?: ToolCall[]
  toolResults?: ToolResult[]
  parentMessageId?: string
  retryCount?: number
  /**
   * @description: 用于展示提问时的附件(如果有)
   */
  attachments?: Array<any>
  /**
   * @description: 是否已阅读
   */
  isRead?: boolean
  /**
   * @description: 推荐问题
   */
  suggestMessage?: string[]
  /**
   * @description: 点赞点踩状态 0: 未点赞未点踩 1: 已点赞 -1: 已点踩
   */
  likeStatus?: 0 | 1 | -1
}

export enum MessageStatus {
  PENDING = 1,
  STREAMING = 2,
  COMPLETE = 3,
  ERROR = 4,
  STOP = 5,
}
export type ToolCall = {
  index: number
  id?: string
  type?: any
  function: {
    name: string
    arguments: string
  }
}

export interface ToolResult {
  toolCallId: string
  result: any
}

export type PluginRequestPayload = {
  id?: string
  apiName?: string
  arguments: string
  identifier?: string
  type?: string
}
export interface ChatSession {
  id: string
  controller: AbortController
  currentMessage: ChatMessage | null
  isLoading: boolean
  retryCount: number
  startTime: number
  lastError?: Error
}

export interface StreamProcessorHandlers {
  onStart?: () => Promise<void> | void
  onToken?: (token: string) => Promise<void> | void
  onToolCall?: (toolCall: ToolCall[]) => Promise<void> | void
  onFinish?: (fullText: string) => Promise<void> | void
  onError?: (error: any) => Promise<void> | void
}

export interface MessageHandler {
  onCreate: () => ChatMessage
  onToolCall?: (toolCalls: ToolCall[]) => void
  onToken: (message: ChatMessage) => void
  onComplete: (message: ChatMessage) => void
  onStop: (message: ChatMessage) => void
  onError: (message: ChatMessage, error: Error) => void
}

export interface ChatConfig {
  maxRetries: number
  retryDelay: number
  typingDelay: {
    min: number
    max: number
  }
}

export interface ApiResponse {
  id: string
  choices: Array<{
    delta?: {
      content?: string
      tool_calls?: ToolCall[]
    }
    finish_reason?: string
  }>
}
export interface ImageMessage {
  text?: string
  type?: string
  image_url?: {
    detail: string
    url: string
  }
}
export interface MessageType {
  content: string | ImageMessage[] | undefined
  name?: string
  tool_call_id?: any
  role: Role
}
export type UseChatParams = {
  /**
   * @description 滚动到底部
   */
  scrollToBottom?: () => void
}
export type ChatHook = {
  /**
   * @description 发送消息
   */
  sendMessage: (params?: any) => void
  /**
   * @description 停止流
   */
  stopStream: (params?: any) => void
}
export type UseChatHookFn = (params?: UseChatParams) => ChatHook

export interface UploadFileInfo {
  id: string
  name: string
  batchId?: string | null
  percentage?: number | null
  status: 'pending' | 'uploading' | 'finished' | 'removed' | 'error'
  url?: string | null
  file?: File | null
  thumbnailUrl?: string | null
  type?: string | null
  fullPath?: string | null
}
export type BuiltinType =
  | 'markdown'
  | 'image'
  | 'table'
  | 'video'
  | 'audio'
  | 'file'
  | 'sql'
  | 'link'
  | 'page'
  | 'action'
  | 'knowledge'
  | 'search-engine'
  | 'article'
  | 'bar-chart'
  | 'line-chart'
  | 'pie-chart'
  | 'area-chart'
export type PluginType = 'standalone' | BuiltinType
