import { ErrorOptions, IntegrationError } from '@stone-js/core'

/**
 * Thrown when the light key-router is misconfigured (e.g. used alongside the full `@Routing`).
 */
export class KeyRoutingError extends IntegrationError {
  constructor (message: string, options: ErrorOptions = {}) {
    super(message, options)
    this.name = 'KeyRoutingError'
  }
}
