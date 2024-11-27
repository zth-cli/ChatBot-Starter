export * from './utils'
export * from './errorAnalyzer'

// 防抖
export function debounce(fn: (...args: any[]) => void, delay = 500) {
  let timer: any = null
  return () => {
    // eslint-disable-next-line prefer-rest-params
    const args = arguments
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn.apply(this, [...args])
    }, delay)
  }
}

/**
 * @description: 判断值是否未某个类型
 */
export function is(val: unknown, type: string) {
  return toString.call(val) === `[object ${type}]`
}
/**
 * @description: 是否为对象
 */
export const isObject = (val: any): val is Record<any, any> => {
  return val !== null && is(val, 'Object')
}

/**
 * @description: 是否已定义
 */
export const isDef = <T = unknown>(val?: T): val is T => {
  return typeof val !== 'undefined'
}

export const isUnDef = <T = unknown>(val?: T): val is T => {
  return !isDef(val)
}
export function isValidJson(jsonString: string): boolean {
  try {
    JSON.parse(jsonString)
    return true
  } catch (error) {
    return false
  }
}

/**
 * @description: 图片文件转 base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      resolve(reader.result as string)
    }
    reader.onerror = (error) => {
      reject(error)
    }
  })
}

/**
 * 判断传入的项是否为File或Blob实例。
 *
 * 该函数用于确定一个对象是否是File或Blob类型的实例。File和Blob是浏览器环境中用于处理二进制数据的两种常见对象类型。
 * 它们通常用于处理上传的文件或大块二进制数据。此函数的目的是提供一种简单的方法来检查一个对象是否属于这两种类型之一。
 *
 * @param item 待检查的对象。
 * @returns 如果item是File或Blob实例，则返回true；否则返回false。
 */
export function isFileOrBlobInstance(item: any) {
  return item instanceof File || item instanceof Blob
}

/**
 * @description: 下载base64文件
 */
export const downloadBase64File = (base64String: string, fileName: string) => {
  // 判断是否是base64格式
  if (!base64String || !base64String.startsWith('data:')) {
    return
  }
  // 获取 base64 字符串中的 MIME 类型
  const mimeType = base64String.split(',')[0].split(':')[1].split(';')[0]

  // 移除 base64 字符串中的数据 URL 前缀
  const byteString = atob(base64String.split(',')[1])

  // 创建 Blob 对象
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  const blob = new Blob([ab], { type: mimeType })

  // 创建下载链接
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName

  // 触发下载
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  // 清理
  window.URL.revokeObjectURL(url)
}
/**
 * @description: 将图片转换为base64格式
 * @param url  图片地址
 */
export const getBase64Image = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = url
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(img, 0, 0, img.width, img.height)
      const dataURL = canvas.toDataURL('image/png')
      resolve(dataURL)
    }
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
  })
}
/**
 * @description: svg下载成图片
 */
export const svgToImage = (svg: string) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const img = new Image()
  img.src = 'data:image/svg+xml,' + encodeURIComponent(svg)
  img.onload = () => {
    canvas.width = img.width
    canvas.height = img.height
    ctx?.drawImage(img, 0, 0)
  }
}

/**
 * @description: 是否是 \u200B
 */
export const isZeroWidthSpace = (str: string | null | undefined) => {
  return str === '\u200B'
}
export const sleep = (ms: number, signal?: AbortSignal) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    // 如果 signal 被中止，清除定时器并拒绝 Promise
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new AbortError('计时器已被中止'))
    })
  })
}
export class AbortError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AbortError'

    // 确保原型链正确
    Object.setPrototypeOf(this, AbortError.prototype)
  }

  // 可选：添加自定义属性
  get code(): string {
    return 'ABORT_ERROR'
  }
}
// 类型守卫
export function isAbortError(error: unknown): error is AbortError {
  return error instanceof AbortError
}
