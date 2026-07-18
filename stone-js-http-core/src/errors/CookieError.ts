import { ErrorOptions, RuntimeError } from '@stone-js/core'

/**
 * Custom error for cookie operations.
 */
export class CookieError extends RuntimeError {
  constructor (message: string, options: ErrorOptions = {}) {
    super(message, options)
    this.name = 'CookieError'
  }
}
