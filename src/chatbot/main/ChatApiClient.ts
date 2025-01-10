import { AbortError, NetworkError } from './ChatError'
import { MessageType, ToolCall } from './types'

const CHAT_CONFIG = {
  stream: true,
  modelTokenId: '201',
} as const

export class ChatApiClient {
  private headers: Record<string, string> = {}
  constructor(
    private apiUrl: string,
    private gatewayUrl: string,
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
  async gateway(params: any): Promise<Response> {
    return await fetch(this.gatewayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Lobe-Plugin-Settings': `{"BING_API_KEY":"${import.meta.env.VITE_BING_API_KEY}","count":"8"}`,
        ...this.headers,
      },
      body: JSON.stringify(params),
    })
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
  messages: MessageType[]
  sessionId: string
  files?: File[]
  modelTokenId?: '201' | '32B' | '184'
  stream?: boolean
  tools?: ToolCall[]
}
