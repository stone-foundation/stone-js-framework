import { ErrorOptions, RuntimeError } from '@stone-js/core'

/**
 * Custom error for Integration layer operations.
 */
export class MethodNotAllowedError extends RuntimeError {
  constructor (message: string, options: ErrorOptions = {}) {
    super(message, options)
    this.name = 'MethodNotAllowedError'
  }
}
