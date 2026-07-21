import { ErrorOptions, IntegrationError } from '@stone-js/core'

/**
 * Custom error for Tencent SCF adapter operations.
 */
export class TencentScfAdapterError extends IntegrationError {
  constructor (message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'TencentScfAdapterError'
  }
}
