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

  /**
   * 异步获取与特定聊天ID关联的会话
   * 如果会话已存在，则更新最后使用时间并返回会话核心
   * 如果会话不存在，则确保当前聊天数量不超过最大并发限制，创建新的会话核心，并返回
   * @param chatId 聊天ID，用于标识和获取对应的会话
   * @returns 返回一个Promise，解析为会话核心对象
   */
  async getSession(chatId: string): Promise<T> {
    // 检查聊天ID是否已在缓存中存在
    const existing = this.chatCoreMap.get(chatId)
    if (existing) {
      // 如果存在，更新最后使用时间并返回会话核心
      existing.lastUsed = Date.now()
      return existing.core
    }

    // 确保当前聊天数量不超过最大并发限制
    await this.ensureMaxConcurrentChats()

    // 创建新的会话核心
    const chatCore = this.createChatCore()
    // 将新的会话核心及其创建时间添加到缓存中
    this.chatCoreMap.set(chatId, {
      core: chatCore,
      lastUsed: Date.now(),
    })

    // 返回新的会话核心
    return chatCore
  }

  async stopAllSessions() {
    const promises = Array.from(this.chatCoreMap.keys()).map((chatId) => this.cleanupSession(chatId))
    await Promise.all(promises)
  }
}
