import { StreamProcessorHandlers, ToolCall } from './types'
import { AbortError, StreamError } from './ChatError'

/**
 * 基础流处理器抽象类
 */
abstract class BaseStreamProcessor {
  protected fullText = ''
  protected currentToolCalls: ToolCall[] = []
  protected buffer = ''
  protected isFinished = false

  constructor(protected handlers: StreamProcessorHandlers) {}

  abstract createTransformStream(): TransformStream<string, string>
  /**
   * 重置处理器状态
   */
  public reset() {
    this.fullText = ''
    this.currentToolCalls = []
    this.buffer = ''
    this.isFinished = false
  }
  protected async handleStart() {
    await this.handlers.onStart?.()
  }

  protected async handleError(error: any) {
    await this.handlers.onError?.(error)
  }

  protected async handleFinish() {
    if (!this.isFinished) {
      this.isFinished = true
      await this.handlers.onFinish?.(this.fullText)
    }
  }

  protected async handleToken(content: string) {
    this.fullText += content
    await this.handlers.onToken?.(content)
  }

  protected async handleToolCall(toolCalls: ToolCall[]) {
    this.currentToolCalls = [...this.currentToolCalls, ...toolCalls]
    await this.handlers.onToolCall?.(this.currentToolCalls)
  }
}

/**
 * OpenAI 流处理器
 */
class OpenAIStreamProcessor extends BaseStreamProcessor {
  createTransformStream(): TransformStream<string, string> {
    return new TransformStream({
      start: async () => await this.handleStart(),
      transform: async (chunk: string, controller) => {
        try {
          this.buffer += chunk
          const lines = this.buffer.split('\n')
          this.buffer = lines.pop() || ''

          for (const line of lines) {
            if (!line.trim().startsWith('data:')) continue
            const jsonStr = line.replace('data:', '').trim()

            if (jsonStr === '[DONE]') {
              await this.handleFinish()
              return
            }

            try {
              const json: OpenAIStreamChunk = JSON.parse(jsonStr)
              const { choices } = json

              if (!choices || choices.length === 0) continue

              const { delta } = choices[0]

              if (delta.content) {
                await this.handleToken(delta.content)
              } else if (delta.tool_calls) {
                await this.handleToolCall(delta.tool_calls)
              }
            } catch (parseError) {
              console.warn('OpenAI JSON parse error:', parseError)
              continue
            }
          }
          controller.enqueue(chunk)
        } catch (error) {
          await this.handleError(error)
          controller.error(error)
        }
      },
    })
  }
}

/**
 * Ollama 流处理器
 */
class OllamaStreamProcessor extends BaseStreamProcessor {
  createTransformStream(): TransformStream<string, string> {
    return new TransformStream({
      start: async () => await this.handleStart(),
      transform: async (chunk: string, controller) => {
        try {
          this.buffer += chunk
          const lines = this.buffer.split('\n')
          this.buffer = lines.pop() || ''

          for (const line of lines) {
            if (!line.trim()) continue

            try {
              const json = JSON.parse(line)

              if (json.response) {
                await this.handleToken(json.response)
              }

              if (json.done) {
                await this.handleFinish()
                return
              }
            } catch (parseError) {
              console.warn('Ollama JSON parse error:', parseError)
              continue
            }
          }
          controller.enqueue(chunk)
        } catch (error) {
          await this.handleError(error)
          controller.error(error)
        }
      },
    })
  }
}

/**
 * 流处理器工厂类
 */
export class StreamProcessor {
  private processor: BaseStreamProcessor

  constructor(
    private handlers: StreamProcessorHandlers,
    processorType: ProcessorType = ProcessorType.OPENAI,
  ) {
    this.processor =
      processorType === ProcessorType.OPENAI ? new OpenAIStreamProcessor(handlers) : new OllamaStreamProcessor(handlers)
  }

  async processStream(response: Response): Promise<void> {
    this.processor.reset()
    if (!response.body) {
      throw new StreamError('Response body is null')
    }

    const reader = response.body
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(this.processor.createTransformStream())
      .getReader()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
      }
    } catch (error) {
      if (error instanceof AbortError) {
        return
      }
      this.handlers.onError(error)
    } finally {
      reader.releaseLock()
    }
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

// 处理器类型枚举
export enum ProcessorType {
  OPENAI = 'openai',
  OLLAMA = 'ollama',
}
