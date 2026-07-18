import { ErrorOptions, RuntimeError } from '@stone-js/core'

/**
 * BadRequestError http error.
 */
export class BadRequestError extends RuntimeError {
  constructor (message: string, options: ErrorOptions = {}) {
    super(message, options)
    this.name = 'BadRequestError'
  }
}
