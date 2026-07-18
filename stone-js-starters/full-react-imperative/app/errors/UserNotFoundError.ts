import { ErrorOptions, RuntimeError } from '@stone-js/core'

/**
 * User Not found Error
 */
export class UserNotFoundError extends RuntimeError {
  constructor (message: string, options: ErrorOptions = {}) {
    super(message, options)
    this.name = 'UserNotFoundError'
  }
}
