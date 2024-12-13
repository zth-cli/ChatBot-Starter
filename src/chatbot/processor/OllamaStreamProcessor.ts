import { BaseStreamProcessor } from './BaseStreamProcessor'

/**
 * Ollama 流处理器
 */
export class OllamaStreamProcessor extends BaseStreamProcessor {
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
