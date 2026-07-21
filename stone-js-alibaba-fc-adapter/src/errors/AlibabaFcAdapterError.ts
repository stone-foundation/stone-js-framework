import { ErrorOptions, IntegrationError } from '@stone-js/core'

/**
 * Custom error for Alibaba FC adapter operations.
 */
export class AlibabaFcAdapterError extends IntegrationError {
  constructor (message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'AlibabaFcAdapterError'
  }
}
