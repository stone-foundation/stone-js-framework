import { ErrorOptions, InitializationError } from '@stone-js/core'

/**
 * Custom error for Browser operations.
 */
export class BrowserError extends InitializationError {
  constructor (message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'BrowserError'
  }
}
