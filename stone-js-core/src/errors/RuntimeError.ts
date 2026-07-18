import { ErrorOptions } from '../declarations'

/**
 * Class representing a RuntimeError.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 */
export class RuntimeError extends Error {
  readonly code?: string
  readonly cause?: Error
  readonly metadata?: unknown

  /**
   * Create a RuntimeError.
   *
   * @param options - The options to create a RuntimeError.
   * @returns A new RuntimeError instance.
   */
  static create<T extends RuntimeError = RuntimeError>(message: string, options: ErrorOptions = {}): T {
    return new this(message, options) as T
  }

  /**
   * Create a RuntimeError.
   *
   * @param message - The message to log.
   * @param options - The error options.
   */
  constructor (message: string, options: ErrorOptions = {}) {
    super(message)
    this.code = options.code
    this.name = 'RuntimeError'
    this.metadata = options.metadata
    if (options.cause !== undefined) {
      this.cause = options.cause
    }

    if (Error.captureStackTrace !== undefined) {
      Error.captureStackTrace(this, this.constructor) // Official V8 method to capture the stack trace, excluding the constructor
    } else {
      this.stack = new Error(message).stack // Fallback for environments without captureStackTrace
    }
  }

  /**
   * Converts the error to a formatted string representation.
   *
   * @param multiline - Determine if output value must be multiline or not.
   * @returns A formatted error string.
   */
  toString (multiline: boolean = false): string {
    const baseMessage = `Error: ${this.name}`
    const codeMessage = this.code !== undefined ? `Code: ${String(this.code)}` : ''
    const mainMessage = `Message: "${this.message}"`
    const metadataMessage = this.metadata !== undefined ? `Metadata: ${JSON.stringify(this.metadata)}` : ''

    if (multiline) {
      return [baseMessage, codeMessage, mainMessage, metadataMessage]
        .filter(Boolean)
        .join('\n')
    }

    return [
      `[${this.name}]`,
      this.code !== undefined ? `Code: ${String(this.code)}` : '',
      `Message: "${this.message}"`,
      this.metadata !== undefined ? `Metadata: ${JSON.stringify(this.metadata)}` : ''
    ]
      .filter(Boolean)
      .join(', ')
  }
}
