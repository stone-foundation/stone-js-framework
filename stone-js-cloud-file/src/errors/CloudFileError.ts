import { IntegrationError } from '@stone-js/core'
import type { ErrorOptions } from '@stone-js/core'

/**
 * Thrown when a cloud-file disk is misconfigured or its provider SDK is missing.
 */
export class CloudFileError extends IntegrationError {
  constructor (message: string, options: ErrorOptions = {}) {
    super(message, options)
    this.name = 'CloudFileError'
  }
}
