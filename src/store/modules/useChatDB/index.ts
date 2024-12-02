import { defineStore } from 'pinia'

export const useChatDB = defineStore('chatIndexDB', () => {
  const worker = new Worker(new URL('./dbWorker.ts', import.meta.url), { type: 'module' })
  let messageId = 0

  // 创建一个通用的消息发送函数
  const sendMessage = (type: string, payload?: any) => {
    return new Promise((resolve, reject) => {
      const id = messageId++

      const handler = (e: MessageEvent) => {
        const { id: responseId, result, error } = e.data
        if (responseId === id) {
          worker.removeEventListener('message', handler)
          if (error) reject(new Error(error))
          else resolve(result)
        }
      }

      worker.addEventListener('message', handler)
      worker.postMessage({ type, payload, id })
    })
  }

  const get = async <T>(key: string): Promise<T | null> => {
    return sendMessage('get', { key }) as Promise<T | null>
  }

  const set = async <T>(key: string, value: any): Promise<T> => {
    return sendMessage('set', { key, value }) as Promise<T>
  }

  const remove = async (key: string) => {
    return sendMessage('remove', { key })
  }

  const clear = async () => {
    return sendMessage('clear')
  }

  return {
    get,
    set,
    remove,
    clear,
  }
})
