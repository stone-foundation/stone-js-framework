import statuses from 'statuses'
import { HeadersType } from '../declarations'
import { ErrorOptions, RuntimeError } from '@stone-js/core'

/**
 * Class representing an HttpError.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 */
export class HttpError extends RuntimeError {
  readonly statusCode: number
  readonly headers: HeadersType
  readonly statusMessage: string

  /**
   * Create an HttpError.
   *
   * @param message - The message to log.
   * @param options - The error options.
   */
  constructor (message: string, statusCode: number = 500, headers: HeadersType = new Headers(), options: ErrorOptions = {}) {
    super(message, options)

    this.name = 'HttpError'
    this.headers = headers
    this.statusCode = statusCode
    this.statusMessage = statuses.message[this.statusCode] ?? 'Unknown Status'
  }
}
