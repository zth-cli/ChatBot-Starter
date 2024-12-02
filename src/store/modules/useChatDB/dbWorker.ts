import localforage from 'localforage'

const db = localforage.createInstance({
  name: 'ZthChatIndexedDB',
})

// 处理来自主线程的消息
self.addEventListener('message', async (e) => {
  const { type, payload, id } = e.data
  let result

  try {
    switch (type) {
      case 'get':
        result = await db.getItem(payload.key)
        break
      case 'set':
        result = await db.setItem(payload.key, payload.value)
        break
      case 'remove':
        result = await db.removeItem(payload.key)
        break
      case 'clear':
        result = await db.clear()
        break
    }
    // 发送成功响应
    self.postMessage({ id, result })
  } catch (error) {
    // 发送错误响应
    self.postMessage({ id, error: error.message })
  }
})
