import { ErrorOptions, RuntimeError } from '@stone-js/core'

/**
 * NotFound http error.
 */
export class NotFoundError extends RuntimeError {
  constructor (message: string, options: ErrorOptions = {}) {
    super(message, options)
    this.name = 'NotFoundError'
  }
}
