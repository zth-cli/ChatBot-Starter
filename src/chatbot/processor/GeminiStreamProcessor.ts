import { BaseStreamProcessor } from './BaseStreamProcessor'
import { GeminiStreamChunk } from './types'

export class GeminiStreamProcessor extends BaseStreamProcessor {
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
              const json: GeminiStreamChunk = JSON.parse(line)

              // Gemini的响应格式处理
              if (json.candidates && json.candidates[0]?.content?.parts) {
                const content = json.candidates[0].content.parts[0]?.text || ''
                if (content) {
                  await this.handleToken(content)
                }
              }

              // 检查是否完成
              if (json.candidates && json.candidates[0]?.finishReason === 'STOP') {
                await this.handleFinish()
                return
              }

              // 处理工具调用
              if (json.candidates && json.candidates[0]?.content?.parts[0]?.functionCall) {
                const toolCalls = [
                  {
                    id: json.candidates[0].content.parts[0].functionCall.name,
                    function: {
                      name: json.candidates[0].content.parts[0].functionCall.name,
                      arguments: JSON.stringify(
                        json.candidates[0].content.parts[0].functionCall.args,
                      ),
                    },
                  },
                ]
                await this.handleToolCall(toolCalls)
              }
            } catch (parseError) {
              console.warn('Gemini JSON parse error:', parseError)
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
