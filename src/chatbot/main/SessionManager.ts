import { ChatSession, ChatConfig, MessageStatus } from './types'
import { ChatError } from './ChatError'

export class SessionManager {
  private sessions: Map<string, ChatSession> = new Map()
  private config: ChatConfig

  constructor(config: ChatConfig) {
    this.config = config
  }

  createSession(id: string): ChatSession {
    if (this.sessions.size >= this.config.maxConcurrentChats) {
      throw new ChatError('Maximum concurrent chats reached', 'MAX_SESSIONS_EXCEEDED')
    }

    const session: ChatSession = {
      id,
      controller: new AbortController(),
      currentMessage: null,
      isLoading: false,
      retryCount: 0,
    }
    this.sessions.set(id, session)
    return session
  }

  getSession(id: string): ChatSession | undefined {
    return this.sessions.get(id)
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

  getSessionStatus() {
    return {
      activeSessions: this.sessions.size,
      canStartNew: this.sessions.size < this.config.maxConcurrentChats,
    }
  }
}
