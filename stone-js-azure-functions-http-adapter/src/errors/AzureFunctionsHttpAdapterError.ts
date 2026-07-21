import { IntegrationError } from '@stone-js/core'
import type { ErrorOptions } from '@stone-js/core'

/**
 * Error thrown by the AzureFunctionsHttp adapter.
 */
export class AzureFunctionsHttpAdapterError extends IntegrationError {
  /**
   * @param message - The error message.
   * @param options - The error options.
   */
  constructor (message: string, options: ErrorOptions = {}) {
    super(message, options)
    this.name = 'AzureFunctionsHttpAdapterError'
  }
}
