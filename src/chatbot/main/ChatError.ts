export class ChatError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false,
  ) {
    super(message)
    this.name = 'ChatError'
  }
}

export class NetworkError extends ChatError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR', true)
  }
}

export class StreamError extends ChatError {
  constructor(message: string) {
    super(message, 'STREAM_ERROR', true)
  }
}

export class AbortError extends ChatError {
  constructor(message: string) {
    super(message, 'ABORT_ERROR', false)
  }
}
