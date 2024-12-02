import { StreamProcessorHandlers, ToolCall } from './types'
import { AbortError, StreamError } from './ChatError'

/**
 * @description 流处理器
 */
export class StreamProcessor {
  // 存储完整的响应文本
  private fullText = ''
  // 存储当前的工具调用列表
  private currentToolCalls: ToolCall[] = []
  // 用于存储未处理完的数据
  private buffer = ''
  // 标记流是否已经处理完成
  private isFinished = false
  // 处理器类型
  private processorType: ProcessorType

  constructor(
    private handlers: StreamProcessorHandlers,
    processorType: ProcessorType = ProcessorType.OPENAI, // 默认使用 OpenAI 处理器
  ) {
    this.processorType = processorType
  }

  // 处理响应流
  async processStream(response: Response): Promise<void> {
    if (!response.body) {
      throw new StreamError('Response body is null')
    }

    // 根据处理器类型选择相应的处理器
    const processor = this.processorType === ProcessorType.OPENAI ? this.openAIProcessor() : this.ollamaProcessor()

    // 创建流处理管道：解码文本 -> 处理数据 -> 读取结果
    const reader = response.body.pipeThrough(new TextDecoderStream()).pipeThrough(processor).getReader()

    this.handlers.onStart?.()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
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

  // 创建openAI规范数据流转换器
  private openAIProcessor() {
    return new TransformStream({
      // 流开始时的处理
      start: async () => {
        await this.handlers.onStart?.()
      },

      // 处理每个数据块
      transform: async (chunk: string, controller) => {
        try {
          // 将新数据添加到缓冲区
          this.buffer += chunk
          // 按换行符分割数据
          const lines = this.buffer.split('\n')
          // 保留最后一个可能不完整的行
          this.buffer = lines.pop() || ''

          for (const line of lines) {
            // 跳过非数据行
            if (!line.trim().startsWith('data:')) continue

            // 提取 JSON 字符串
            const jsonStr = line.replace('data:', '').trim()

            // 处理流结束标记
            if (jsonStr === '[DONE]' && !this.isFinished) {
              this.isFinished = true
              await this.handlers.onFinish?.(this.fullText)
              return
            }

            try {
              // 解析 JSON 数据
              const json: OpenAIStreamChunk = JSON.parse(jsonStr)
              const { choices } = json

              if (!choices || choices.length === 0) continue

              const { delta } = choices[0]

              // 处理文本内容
              if (delta.content) {
                this.fullText += delta.content
                await this.handlers.onToken?.(delta.content)
              }
              // 处理工具调用
              else if (delta.tool_calls) {
                this.currentToolCalls = [...this.currentToolCalls, ...delta.tool_calls]
                await this.handlers.onToolCall?.(this.currentToolCalls)
              }
            } catch (parseError) {
              console.warn('openAI JSON parse error:', parseError)
              continue
            }
          }

          // 将处理后的数据传递给下一个处理器
          controller.enqueue(chunk)
        } catch (error) {
          await this.handlers.onError?.(error)
        }
      },
    })
  }
  // 创建ollama规范数据流转换器
  private ollamaProcessor() {
    return new TransformStream({
      // 流开始时的处理
      start: async () => {
        await this.handlers.onStart?.()
      },

      // 处理每个数据块
      transform: async (chunk: string, controller) => {
        try {
          // 将新数据添加到缓冲区
          this.buffer += chunk
          // 按换行符分割数据
          const lines = this.buffer.split('\n')
          // 保留最后一个可能不完整的行
          this.buffer = lines.pop() || ''

          for (const line of lines) {
            if (!line.trim()) continue

            try {
              const json = JSON.parse(line)

              // 处理响应内容
              if (json.response) {
                this.fullText += json.response
                await this.handlers.onToken?.(json.response)
              }

              // 处理完成标志
              if (json.done && !this.isFinished) {
                this.isFinished = true
                await this.handlers.onFinish?.(this.fullText)
                return
              }
            } catch (parseError) {
              console.warn('Ollama JSON parse error:', parseError)
              continue
            }
          }

          controller.enqueue(chunk)
        } catch (error) {
          await this.handlers.onError?.(error)
        }
      },
    })
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
