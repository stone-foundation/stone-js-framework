import { ErrorOptions, IntegrationError } from '@stone-js/core'

/**
 * Custom error for Node CLI adapter operations.
 */
export class NodeCliAdapterError extends IntegrationError {
  constructor (message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'NodeCliAdapterError'
  }
}
