import { IntegrationError } from '@stone-js/core'
import type { ErrorOptions } from '@stone-js/core'

/**
 * Thrown when a key has no registered handler, or a handler is malformed.
 */
export class KeyRouterError extends IntegrationError {
  constructor (message: string, options: ErrorOptions = {}) {
    super(message, options)
    this.name = 'KeyRouterError'
  }
}
