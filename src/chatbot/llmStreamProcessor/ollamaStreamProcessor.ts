// Ollama 流式响应的数据块接口定义
export interface OllamaStreamChunk {
  model: string
  created_at: string
  response: string
  done: boolean
  context?: number[]
  total_duration?: number
  load_duration?: number
  prompt_eval_duration?: number
  eval_duration?: number
  eval_count?: number
}

export interface OllamaStreamCallbacks {
  onStart?: () => Promise<void> | void
  onToken?: (token: string) => Promise<void> | void
  onFinish?: (fullText: string) => Promise<void> | void
  onError?: (error: any) => Promise<void> | void
}

// 创建 Ollama 流处理器
export function createOllamaStreamProcessor(callbacks?: OllamaStreamCallbacks) {
  let fullText = ''
  let buffer = ''
  let isFinished = false

  return new TransformStream({
    async start() {
      await callbacks?.onStart?.()
    },

    async transform(chunk: string, controller) {
      try {
        buffer += chunk
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.trim()) continue

          try {
            const json: OllamaStreamChunk = JSON.parse(line)

            if (json.response) {
              fullText += json.response
              await callbacks?.onToken?.(json.response)
            }

            if (json.done && !isFinished) {
              isFinished = true
              await callbacks?.onFinish?.(fullText)
              return
            }
          } catch (parseError) {
            console.warn('JSON parse error:', parseError)
            continue
          }
        }

        controller.enqueue(chunk)
      } catch (error) {
        await callbacks?.onError?.(error)
      }
    },
  })
}
