import { ErrorOptions, IntegrationError } from '@stone-js/core'

/**
 * Thrown when the Node.js WebSocket adapter is misused or `ws` is missing.
 */
export class NodeWsAdapterError extends IntegrationError {
  constructor (message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'NodeWsAdapterError'
  }
}
