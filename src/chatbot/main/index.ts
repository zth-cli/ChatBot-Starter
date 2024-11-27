import { ChatConfig, MessageHandler, ChatMessage, MessageStatus, ToolCall, ChatSession } from './types'
import { SessionManager } from './SessionManager'
import { StreamProcessor } from './StreamProcessor'
import { NetworkError } from './ChatError'
import { ChatApiClient } from './ChatApiClient'

export class ChatCore {
  private sessionManager: SessionManager
  private streamProcessor: StreamProcessor

  constructor(
    private config: ChatConfig,
    private messageHandler: MessageHandler,
    private apiClient: ChatApiClient,
  ) {
    this.sessionManager = new SessionManager(config)
    this.streamProcessor = new StreamProcessor({
      onStart: () => this.handleStart(),
      onToken: (token) => this.handleToken(token),
      onToolCall: (toolCalls) => this.handleToolCall(toolCalls),
      onFinish: (fullText) => this.handleFinish(fullText),
      onError: (error) => this.handleError(error),
    })
  }

  async sendMessage(sessionId: string, message: string): Promise<void> {
    let session = this.sessionManager.getSession(sessionId)
    if (!session) {
      session = this.sessionManager.createSession(sessionId)
    }

    session.isLoading = true
    session.currentMessage = this.messageHandler.onCreate()

    try {
      const response = await this.apiClient.createChatStream(message, session.controller.signal)

      if (!response.ok) {
        throw new NetworkError(`HTTP error! status: ${response.status}`)
      }

      await this.streamProcessor.processStream(response)
    } catch (error) {
      await this.handleError(error)

      // 重试逻辑
      if (error.retryable && this.sessionManager.canRetry(session)) {
        session.retryCount++
        await this.retry(sessionId, message)
      }
    }
  }

  private async retry(sessionId: string, message: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, this.config.retryDelay))

    this.sessionManager.resetSession(sessionId)
    return this.sendMessage(sessionId, message)
  }

  stopStream(sessionId: string): void {
    const session = this.sessionManager.getSession(sessionId)
    if (session) {
      session.controller.abort()
      this.sessionManager.deleteSession(sessionId)
    }
  }

  private handleStart(): void {
    // 处理开始
    console.log('handleStart')
  }

  private handleToken(token: string): void {
    // 处理token
    const session = this.getCurrentSession()
    if (!session?.currentMessage) return

    const updatedMessage = {
      ...session.currentMessage,
      content: session.currentMessage.content + token,
    }
    this.messageHandler.onToken(updatedMessage)
  }

  private async handleToolCall(toolCalls: ToolCall[]): Promise<void> {
    // 处理工具调用
    const session = this.getCurrentSession()
    if (!session?.currentMessage) return

    const updatedMessage = {
      ...session.currentMessage,
      toolCalls: [...(session.currentMessage.toolCalls || []), ...toolCalls],
    }

    this.messageHandler.onToolCall(updatedMessage.toolCalls)
  }

  private handleFinish(fullText: string): void {
    const session = this.getCurrentSession()
    if (!session?.currentMessage) return

    const completedMessage = {
      ...session.currentMessage,
      status: MessageStatus.COMPLETE,
      content: fullText,
    }

    this.messageHandler.onComplete(completedMessage)
    session.isLoading = false
  }

  private async handleError(error: Error): Promise<void> {
    const session = this.getCurrentSession()
    if (!session?.currentMessage) return

    const errorMessage = {
      ...session.currentMessage,
      status: MessageStatus.ERROR,
    }

    this.messageHandler.onError(errorMessage, error)
    session.isLoading = false
    session.lastError = error
  }

  private getCurrentSession(): ChatSession | undefined {
    // 获取当前活动会话的逻辑
    return Array.from(this.sessionManager.sessions.values()).find((session) => session.isLoading)
  }
}
