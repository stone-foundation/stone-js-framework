import { ErrorOptions, IntegrationError } from '@stone-js/core'

/**
 * Custom error for React Native adapter operations.
 */
export class ReactNativeAdapterError extends IntegrationError {
  constructor (message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'ReactNativeAdapterError'
  }
}
