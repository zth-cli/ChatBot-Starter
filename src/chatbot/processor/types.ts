export interface StreamProcessorHandlers {
  onStart?: () => Promise<void> | void
  onToken?: (token: string) => Promise<void> | void
  onToolCall?: (toolCall: ToolCall[]) => Promise<void> | void
  onFinish?: (fullText: string) => Promise<void> | void
  onError?: (error: any) => Promise<void> | void
}

export type ToolCall = {
  id?: string
  type?: any
  function: {
    name: string
    arguments?: string
  }
}

// OpenAI 流式响应的数据块接口定义
export interface OpenAIStreamChunk {
  id: string
  object: string
  created: number
  model: string
  choices: {
    index: number
    delta: {
      content?: string
      tool_calls?: ToolCall[]
    }
    finish_reason: string | null
  }[]
}
// Gemini响应类型定义
export interface GeminiStreamChunk {
  candidates: {
    content: {
      parts: {
        text?: string
        functionCall?: {
          name: string
          args: Record<string, any>
        }
      }[]
    }
    finishReason: string | null
  }[]
}
// 处理器类型枚举
export enum ProcessorType {
  OPENAI = 'openai',
  OLLAMA = 'ollama',
  GEMINI = 'gemini',
}
