import { ChatConfig, MessageHandler, ChatMessage, MessageStatus, ToolCall, ChatSession } from './types'
import { SessionManager } from './SessionManager'
import { StreamProcessor } from './StreamProcessor'
import { NetworkError } from './ChatError'
import { ChatApiClient, ChatPayload } from './ChatApiClient'
import { sleep } from './helper'

export class ChatCore {
  private sessionManager: SessionManager
  private streamProcessor: StreamProcessor
  private currentSessionId: string | undefined

  constructor(
    private config: ChatConfig,
    private messageHandler: MessageHandler & { onStop: (message: ChatMessage) => void },
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

  async sendMessage<T extends ChatPayload>(sessionId: string, message: T): Promise<void> {
    this.currentSessionId = sessionId
    const session = this.sessionManager.getOrCreateSession(sessionId, (chatId) => {
      this.stopStream(chatId)
    })

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

  setApiClientHeaders(headers: Record<string, string>) {
    this.apiClient.setHeaders(headers)
  }
  private async retry<T extends ChatPayload>(sessionId: string, message: T): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, this.config.retryDelay))

    this.sessionManager.resetSession(sessionId)
    return this.sendMessage(sessionId, message)
  }

  stopStream(sessionId: string): void {
    const session = this.sessionManager.getSession(sessionId)
    if (session) {
      this.messageHandler.onStop(session.currentMessage)
      session.controller.abort()
      this.sessionManager.deleteSession(sessionId)
    }
  }

  private handleStart(): void {
    // 处理开始
    console.log('handleStart')
  }

  private async handleToken(token: string): Promise<void> {
    // 处理token
    const session = this.getCurrentSession()
    if (!session?.currentMessage) return
    await this.appendTokenWithDelay(token, session, this.messageHandler.onToken)
  }
  /**
   * @description 在每个字符后添加延迟
   */
  private async appendTokenWithDelay(token: string, session: ChatSession, handler: MessageHandler['onToken']) {
    const chars = token.split('')
    for (const char of chars) {
      session.currentMessage!.content += char
      await handler(session.currentMessage)
      await sleep(
        Math.random() * (this.config.typingDelay.max - this.config.typingDelay.min) + this.config.typingDelay.min,
        session.controller.signal,
      )
    }
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

  private async handleFinish(fullText: string): Promise<void> {
    const session = this.getCurrentSession()
    if (!session?.currentMessage) return

    const completedMessage = {
      ...session.currentMessage,
      status: MessageStatus.COMPLETE,
      content: fullText,
    }

    await this.messageHandler.onComplete(completedMessage)
    session.isLoading = false
    this.sessionManager.deleteSession(session.id) // 移除当前消息
    this.currentSessionId = undefined // 移除当前会话id
  }

  private async handleError(error: Error): Promise<void> {
    this.logError(`处理错误: ${error.message}`, error)
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
    return this.currentSessionId ? this.sessionManager.getSession(this.currentSessionId) : undefined
  }
  private logInfo(message: string): void {
    console.log(`[ChatCore] ${message}`)
  }

  private logError(message: string, error?: Error): void {
    console.error(`[ChatCore] ${message}`, error)
  }
}
