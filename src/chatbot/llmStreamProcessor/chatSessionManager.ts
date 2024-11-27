import { PluginRequestPayload } from '@rzx/chat-plugin-sdk'

export interface ChatSession {
  controller: AbortController
  lastMessage: IChatMessage | null
  pendingToolCalls?: PluginRequestPayload
  isLoading: boolean
  startTime: number
}

export class ChatSessionManager {
  private sessions = new Map<string, ChatSession>()
  private readonly maxConcurrentChats: number

  constructor(maxConcurrentChats: number = 3) {
    this.maxConcurrentChats = maxConcurrentChats
  }

  getActiveSessionCount(): number {
    let count = 0
    this.sessions.forEach((session) => {
      if (session.isLoading) count++
    })
    return count
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
      if (this.sessions.size >= this.maxConcurrentChats) {
        const oldestSession = this.findOldestSession()
        if (oldestSession) {
          onStopStream(oldestSession)
        }
      }

      this.sessions.set(chatId, {
        controller: new AbortController(),
        lastMessage: null,
        pendingToolCalls: undefined,
        isLoading: false,
        startTime: Date.now(),
      })
    }
    return this.sessions.get(chatId)!
  }

  getSession(chatId: string): ChatSession | undefined {
    return this.sessions.get(chatId)
  }

  deleteSession(chatId: string) {
    this.sessions.delete(chatId)
  }

  getSessionStatus() {
    return {
      activeSessions: this.getActiveSessionCount(),
      maxSessions: this.maxConcurrentChats,
      canStartNew: this.getActiveSessionCount() < this.maxConcurrentChats,
    }
  }
}
