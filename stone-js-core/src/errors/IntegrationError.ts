import { RuntimeError } from './RuntimeError'
import { ErrorOptions } from '../declarations'

/**
 * Custom error for Integration layer operations.
 */
export class IntegrationError extends RuntimeError {
  constructor (message: string, options: ErrorOptions = {}) {
    super(message, options)
    this.name = 'IntegrationError'
  }
}
