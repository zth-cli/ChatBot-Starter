import { AbortError, NetworkError } from './ChatError'

export class ChatApiClient {
  constructor(
    private baseUrl: string,
    private apiKey: string,
  ) {}

  async createChatStream(message: string, signal: AbortSignal): Promise<Response> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: message }],
          stream: true,
        }),
        signal,
      })

      return response
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new AbortError('Request was aborted')
      }
      throw new NetworkError(`Failed to create chat stream: ${error.message}`)
    }
  }
}
