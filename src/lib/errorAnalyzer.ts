/**
 * @description 错误分析器
 * @example
 * try {
  // 某些可能抛出错误的代码
  throw new DOMException('BodyStreamBuffer was aborted', 'AbortError');
} catch (error) {
  const analysis = errorAnalyzer.analyze(error);
  console.log(analysis);
  // 输出示例：
  // {
  //   type: 'DOMException',
  //   name: 'AbortError',
  //   message: 'BodyStreamBuffer was aborted',
  //   code: 20,
  //   details: {
  //     isStreamAbort: true,
  //     stack: '...'
  //   }
  // }

  if (ErrorAnalyzer.isStreamAbortError(error)) {
    console.log('这是一个流中断错误');
  }
}
 */

export class errorAnalyzer {
  static analyze(error: unknown): {
    type: string
    name?: string
    message?: string
    code?: number
    details: Record<string, any>
  } {
    const result = {
      type: error?.constructor?.name || 'Unknown',
      details: {},
    } as any

    // 基础 Error 类型检查
    if (error instanceof Error) {
      result.name = error.name
      result.message = error.message
      result.details = {
        stack: error.stack,
        cause: error.cause,
      }
    }

    // DOMException 检查
    if (error instanceof DOMException) {
      result.name = error.name
      result.message = error.message
      result.code = error.code
      result.details = {
        ...result.details,
        isStreamAbort: this.isStreamAbortError(error),
      }
    }

    // 如果是普通对象
    if (error && typeof error === 'object') {
      result.details = {
        ...result.details,
        ...Object.fromEntries(
          Object.entries(error).filter(([key]) => !['name', 'message', 'code', 'type'].includes(key)),
        ),
      }
    }

    return result
  }

  static isStreamAbortError(error: unknown): boolean {
    return (
      error instanceof DOMException &&
      (error.name === 'AbortError' || error.message.includes('BodyStreamBuffer was aborted'))
    )
  }

  static isNetworkError(error: unknown): boolean {
    return error instanceof TypeError && error.message.includes('NetworkError')
  }

  static isTypeError(error: unknown): boolean {
    return error instanceof TypeError
  }
}
