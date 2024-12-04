import { AbortError, NetworkError } from './ChatError'
import { MessageType, ToolCall } from './types'

const CHAT_CONFIG = {
  CHAT_FLOW_ID: import.meta.env.VITE_CHAT_FLOW_ID,
  stream: true,
  model: 'gpt-40',
  temperature: 0.6,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
} as const

export class ChatApiClient {
  private headers: Record<string, string> = {}
  constructor(
    private apiUrl: string,
    private apiKey: string,
  ) {}

  setHeaders(headers: Record<string, string>) {
    this.headers = headers
  }
  async createChatStream(body: ChatPayload, signal: AbortSignal): Promise<Response> {
    try {
      const formData = this.objectToFormData({ ...CHAT_CONFIG, ...body })
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          ...this.headers,
        },
        body: formData,
        signal,
      })

      return response
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new AbortError('请求被中止')
      }
      throw new NetworkError(`创建聊天流失败: ${error.message}`)
    }
  }
  setApiClientHeaders(headers: Record<string, string>) {
    this.headers = headers
  }

  /**
   * 将对象转换为 FormData，对象类型直接 JSON 序列化
   * @param obj 要转换的对象
   * @returns FormData
   */
  objectToFormData = (obj: Record<string, any>): FormData => {
    const formData = new FormData()

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key]

        if (value === null || value === undefined) {
          continue
        } else if (value instanceof File || value instanceof Blob) {
          formData.append(key, value)
        } else if (typeof value === 'object') {
          // 对象类型直接 JSON 序列化
          formData.append(key, JSON.stringify(value))
        } else {
          formData.append(key, String(value))
        }
      }
    }

    return formData
  }
}
export interface ChatPayload {
  question?: string
  frequency_penalty?: 0
  messages: MessageType[]
  files?: File[]
  model?: string
  presence_penalty?: 0
  stream?: boolean
  temperature?: 0.6
  tools?: ToolCall[]
  top_p?: 1
  [key: string]: any
}
