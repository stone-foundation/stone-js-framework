import { ErrorOptions, IntegrationError } from '@stone-js/core'

/**
 * Custom error for GCP Cloud Functions adapter operations.
 */
export class GcpCloudFunctionsAdapterError extends IntegrationError {
  constructor (message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'GcpCloudFunctionsAdapterError'
  }
}
