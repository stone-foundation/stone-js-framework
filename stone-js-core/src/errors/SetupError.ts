import { RuntimeError } from './RuntimeError'
import { ErrorOptions } from '../declarations'

/**
 * Custom error for Setup layer operations.
 */
export class SetupError extends RuntimeError {
  constructor (message: string, options: ErrorOptions = {}) {
    super(message, options)
    this.name = 'SetupError'
  }
}
