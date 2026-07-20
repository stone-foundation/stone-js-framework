import { ErrorOptions, IntegrationError } from '@stone-js/core'

/**
 * Custom error for node http adapter operations.
 */
export class GcpCloudFunctionsHttpAdapterError extends IntegrationError {
  constructor (message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'GcpCloudFunctionsHttpAdapterError'
  }
}
