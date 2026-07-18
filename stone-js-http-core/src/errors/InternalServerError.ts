import { ErrorOptions, RuntimeError } from '@stone-js/core'

/**
 * InternalServer http error.
 */
export class InternalServerError extends RuntimeError {
  constructor (message: string, options: ErrorOptions = {}) {
    super(message, options)
    this.name = 'InternalServerError'
  }
}
