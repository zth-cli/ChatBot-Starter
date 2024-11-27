import { StreamProcessorHandlers, ApiResponse } from './types'
import { AbortError, StreamError } from './ChatError'
import { createOpenAIStreamProcessor, ToolCall } from '../llmStreamProcessor'

export class StreamProcessor {
  constructor(private handlers: StreamProcessorHandlers) {}

  async processStream(response: Response): Promise<void> {
    if (!response.body) {
      throw new StreamError('Response body is null')
    }

    const reader = response.body.pipeThrough(new TextDecoderStream()).pipeThrough(this.processor()).getReader()

    this.handlers.onStart?.()

    try {
      while (true) {
        while (true) {
          const { done } = await reader.read()
          if (done) break
        }
      }
    } catch (error) {
      if (error instanceof AbortError) {
        // 处理中断请求
        return
      }
      this.handlers.onError(error)
    } finally {
      reader.releaseLock()
    }
  }

  private processor() {
    return createOpenAIStreamProcessor({
      onToken: (token) => this.handlers.onToken?.(token),
      onToolCall: (toolCalls) => this.handlers.onToolCall?.(toolCalls),
      onFinish: (fullText) => this.handlers.onFinish?.(fullText),
      onError: (error) => this.handlers.onError?.(error),
    })
  }
}
