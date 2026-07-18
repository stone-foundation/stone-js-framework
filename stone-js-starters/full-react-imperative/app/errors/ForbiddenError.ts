import { ErrorOptions, RuntimeError } from '@stone-js/core'

/**
 * Not Forbidden Error
 */
export class ForbiddenError extends RuntimeError {
  constructor (message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'ForbiddenError'
  }
}
