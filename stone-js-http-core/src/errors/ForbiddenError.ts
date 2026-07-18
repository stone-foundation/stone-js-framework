import { ErrorOptions, RuntimeError } from '@stone-js/core'

/**
 * Forbidden http error.
 */
export class ForbiddenError extends RuntimeError {
  constructor (message: string, options: ErrorOptions = {}) {
    super(message, options)
    this.name = 'ForbiddenError'
  }
}
