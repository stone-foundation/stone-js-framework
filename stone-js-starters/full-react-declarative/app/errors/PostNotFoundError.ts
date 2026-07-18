import { ErrorOptions, RuntimeError } from '@stone-js/core'

/**
 * Post Not found Error
 */
export class PostNotFoundError extends RuntimeError {
  constructor (message: string, options: ErrorOptions = {}) {
    super(message, options)
    this.name = 'PostNotFoundError'
  }
}
