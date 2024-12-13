import { AbortError, StreamError } from './ChatError'
import { BaseStreamProcessor } from '../processor/BaseStreamProcessor'
import { GeminiStreamProcessor } from '../processor/GeminiStreamProcessor'
import { OllamaStreamProcessor } from '../processor/OllamaStreamProcessor'
import { OpenAIStreamProcessor } from '../processor/OpenAIStreamProcessor'
import { ProcessorType, StreamProcessorHandlers } from '../processor/types'

/**
 * 流处理器工厂类
 */
export class StreamProcessor {
  private processor: BaseStreamProcessor

  constructor(
    private handlers: StreamProcessorHandlers,
    processorType: ProcessorType = ProcessorType.OPENAI,
  ) {
    switch (processorType) {
      case ProcessorType.OPENAI:
        this.processor = new OpenAIStreamProcessor(handlers)
        break
      case ProcessorType.OLLAMA:
        this.processor = new OllamaStreamProcessor(handlers)
        break
      case ProcessorType.GEMINI:
        this.processor = new GeminiStreamProcessor(handlers)
        break
      default:
        this.processor = new OpenAIStreamProcessor(handlers)
    }
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
