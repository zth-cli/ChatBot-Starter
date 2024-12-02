import { ChatSession, ChatConfig, MessageStatus } from './types'
import { ChatError } from './ChatError'

export class SessionManager {
  private sessions: Map<string, ChatSession> = new Map()
  private config: ChatConfig

  constructor(config: ChatConfig) {
    this.config = config
  }

  private findOldestSession(): string | null {
    let oldestTime = Infinity
    let oldestChatId: string | null = null

    this.sessions.forEach((session, chatId) => {
      if (session.isLoading && session.startTime < oldestTime) {
        oldestTime = session.startTime
        oldestChatId = chatId
      }
    })

    return oldestChatId
  }
  getOrCreateSession(chatId: string, onStopStream: (chatId: string) => void): ChatSession {
    if (!this.sessions.has(chatId)) {
      if (this.sessions.size >= this.config.maxConcurrentChats) {
        const oldestSession = this.findOldestSession()
        if (oldestSession) {
          onStopStream(oldestSession)
        }
        if (this.sessions.size >= this.config.maxConcurrentChats) {
          throw new ChatError('Maximum concurrent chats reached', 'MAX_SESSIONS_EXCEEDED')
        }
      }

      const session: ChatSession = {
        id: chatId,
        controller: new AbortController(),
        currentMessage: null,
        isLoading: false,
        retryCount: 0,
        startTime: Date.now(),
      }
      this.sessions.set(chatId, session)
    }
    return this.sessions.get(chatId)!
  }

  getSession(chatId: string): ChatSession | undefined {
    if (!this.validateSession(chatId)) {
      this.deleteSession(chatId)
      return undefined
    }
    return this.sessions.get(chatId)
  }

  updateSession(id: string, updates: Partial<ChatSession>): void {
    const session = this.sessions.get(id)
    if (session) {
      this.sessions.set(id, { ...session, ...updates })
    }
  }

  deleteSession(id: string): void {
    const session = this.sessions.get(id)
    if (session) {
      session.controller.abort()
      this.sessions.delete(id)
    }
  }

  canRetry(session: ChatSession): boolean {
    return session.retryCount < this.config.maxRetries
  }

  resetSession(id: string): void {
    const session = this.sessions.get(id)
    if (session) {
      session.controller = new AbortController()
      session.isLoading = false
      session.lastError = undefined
      if (session.currentMessage) {
        session.currentMessage.status = MessageStatus.PENDING
      }
    }
  }
  cleanupSessions(maxAge: number = 1000 * 60 * 30) {
    // 默认30分钟
    const now = Date.now()
    this.sessions.forEach((session, chatId) => {
      if (now - session.startTime > maxAge) {
        this.deleteSession(chatId)
      }
    })
  }
  private validateSession(chatId: string): boolean {
    const session = this.sessions.get(chatId)
    return session !== undefined && !session.controller.signal.aborted
  }
  getSessionStatus() {
    return {
      activeSessions: this.sessions.size,
      canStartNew: this.sessions.size < this.config.maxConcurrentChats,
    }
  }
}
