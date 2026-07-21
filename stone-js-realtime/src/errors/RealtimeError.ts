import { IntegrationError } from '@stone-js/core'
import type { ErrorOptions } from '@stone-js/core'

/**
 * Thrown when realtime is misconfigured, a driver SDK is missing, or a connection is unknown.
 */
export class RealtimeError extends IntegrationError {
  constructor (message: string, options: ErrorOptions = {}) {
    super(message, options)
    this.name = 'RealtimeError'
  }
}
