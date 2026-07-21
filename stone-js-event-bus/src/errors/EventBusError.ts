import { IntegrationError } from '@stone-js/core'
import type { ErrorOptions } from '@stone-js/core'

/**
 * Thrown when the event bus is misconfigured, a driver SDK is missing, or a connection is unknown.
 */
export class EventBusError extends IntegrationError {
  constructor (message: string, options: ErrorOptions = {}) {
    super(message, options)
    this.name = 'EventBusError'
  }
}
