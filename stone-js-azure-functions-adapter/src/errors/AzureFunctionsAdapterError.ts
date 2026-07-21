import { ErrorOptions, IntegrationError } from '@stone-js/core'

/**
 * Custom error for Azure Functions adapter operations.
 */
export class AzureFunctionsAdapterError extends IntegrationError {
  constructor (message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'AzureFunctionsAdapterError'
  }
}
