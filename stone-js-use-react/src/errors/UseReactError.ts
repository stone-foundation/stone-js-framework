import { ErrorOptions, InitializationError } from '@stone-js/core'

/**
 * Custom error for react operations.
 */
export class UseReactError extends InitializationError {
  constructor (message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'UseReactError'
  }
}
