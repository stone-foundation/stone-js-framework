import { IntegrationError } from '@stone-js/core'
import type { ErrorOptions } from '@stone-js/core'

/**
 * Error thrown by the Fetch adapter.
 */
export class FetchAdapterError extends IntegrationError {
  /**
   * @param message - The error message.
   * @param options - The error options.
   */
  constructor (message: string, options: ErrorOptions = {}) {
    super(message, options)
    this.name = 'FetchAdapterError'
  }
}
