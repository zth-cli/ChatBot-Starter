declare module 'chat' {}

type ChatType = 'chat' | 'db-chat' | 'mask-chat' | 'table-chat' | 'file-chat' | 'concat-chat'

/**
 * @description 历史对话
 */
interface IChatHistory {
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
  children: IChatMessage[]
  /**
   * @description: 是否收藏
   */
  isFavorite?: boolean
}

/**
 * @description: 会话消息
 */
interface IChatMessage<T = any> {
  /**
   * 聊天内容
   */
  content: string | undefined
  /**
   * @description: 消息id
   */
  id?: string
  /**
   * 发送时间
   */
  date: string
  /**
   * 发送人
   */
  role: IChatRole
  /**
   * status 0: 正常 1: 错误 2: 加载中 3: pending
   */
  status?: 0 | 1 | 2 | 3
  /**
   * @description 内容来源
   */
  sourceDocuments?: any[]
  /**
   * @description: 多媒体信息
   */
  mediaMessage?: MediaMessage<T>[]
  /**
   * @description: 推荐问题
   */
  suggestMessage?: string[]
  /**
   * @description: 提示词
   */
  prompt?: string
  /**
   * @description: 用于展示提问时的附件(如果有)
   */
  attachments?: Array<any>
  /**
   * @description: 是否已阅读
   */
  isRead?: boolean
  /**
   * @description: toolCalls
   */
  toolCalls?: any
  /**
   * @description: 工具返回的数据
   */
  toolResults?: any
  /**
   * @description: 点赞点踩状态 0: 未点赞未点踩 1: 已点赞 -1: 已点踩
   */
  likeStatus?: 0 | 1 | -1
  [key: string]: any
}
type MediaMessage<T = any> = {
  type: ConversationType
  data: T
}
/**
 * @description: 角色
 */
type IChatRole = 'user' | 'assistant' | 'system' | 'tool' | 'prompt'

/**
 * @description: 会话展示类型
 */
type ConversationType =
  | 'text'
  | 'sql'
  | 'link'
  | 'page'
  | 'table'
  | 'pie_chart'
  | 'bar_chart'
  | 'line_chart'
  | 'image'
  | 'video'
  | 'audio'
  | 'file'
  | 'article'
/**
 * @description: 聊天框模式 chat docs
 */
type ChatMode = 'chat' | 'docs'
interface UploadFileInfo {
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

/**
 * @description: 意图识别
 */

interface IntentRecognitionResponse {
  type: '1' | '2' // 1 表格数据查询 2 页面唤醒
  agentUrl: string | null
  chain: string
  id: number
  pageDescribe?: string
  pageDescribeVector?: string
  pageName?: string
  pageTag?: string
  systemId?: number
  systemName?: string
  url: string
  [key: string]: any
}

interface UploadFileInfo {
  id: string
  name: string
  percentage?: number | null
  status: 'pending' | 'uploading' | 'finished' | 'removed' | 'error'
  url?: string | null
  file?: File | null
  thumbnailUrl?: string | null
  type?: string | null
  fullPath?: string | null
}
