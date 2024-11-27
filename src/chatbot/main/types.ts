export type Role = 'user' | 'assistant' | 'system' | 'tool'

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
}

export enum MessageStatus {
  PENDING = 1,
  STREAMING = 2,
  COMPLETE = 3,
  ERROR = 4,
}
export type ToolCall = {
  index: number
  id?: string
  type?: 'function'
  function: {
    name: string
    arguments: string
  }
}

export interface ToolResult {
  toolCallId: string
  result: string
}

export interface ChatSession {
  id: string
  controller: AbortController
  currentMessage: ChatMessage | null
  isLoading: boolean
  retryCount: number
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
  onError: (message: ChatMessage, error: Error) => void
}

export interface ChatConfig {
  maxConcurrentChats: number
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
