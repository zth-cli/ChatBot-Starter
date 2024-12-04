interface ChatSession {
  stopStream(): Promise<void>
}
export class ChatSessionManager<T extends ChatSession> {
  private chatCoreMap = new Map<
    string,
    {
      core: T
      lastUsed: number
    }
  >()
  private readonly maxConcurrentChats: number

  constructor(
    private readonly createChatCore: () => T,
    maxConcurrentChats = 3,
  ) {
    this.maxConcurrentChats = maxConcurrentChats
  }

  async cleanupSession(chatId: string) {
    if (this.chatCoreMap.has(chatId)) {
      const session = this.chatCoreMap.get(chatId)
      if (session) {
        // await session.core.stopStream()
        this.chatCoreMap.delete(chatId)
      }
    }
  }

  private async ensureMaxConcurrentChats() {
    if (this.chatCoreMap.size >= this.maxConcurrentChats) {
      let oldestChatId = ''
      let oldestTime = Date.now()

      this.chatCoreMap.forEach((value, key) => {
        if (value.lastUsed < oldestTime) {
          oldestTime = value.lastUsed
          oldestChatId = key
        }
      })

      if (oldestChatId) {
        await this.cleanupSession(oldestChatId)
      }
    }
  }

  async getSession(chatId: string): Promise<T> {
    const existing = this.chatCoreMap.get(chatId)
    if (existing) {
      existing.lastUsed = Date.now()
      return existing.core
    }

    await this.ensureMaxConcurrentChats()

    const chatCore = this.createChatCore()
    this.chatCoreMap.set(chatId, {
      core: chatCore,
      lastUsed: Date.now(),
    })

    return chatCore
  }

  async stopAllSessions() {
    const promises = Array.from(this.chatCoreMap.keys()).map((chatId) => this.cleanupSession(chatId))
    await Promise.all(promises)
  }
}
