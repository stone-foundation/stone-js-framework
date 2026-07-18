import { ErrorOptions, RuntimeError } from '@stone-js/core'

/**
 * MethodNotAllowed http error.
 */
export class MethodNotAllowedError extends RuntimeError {
  constructor (message: string, options: ErrorOptions = {}) {
    super(message, options)
    this.name = 'MethodNotAllowedError'
  }
}
