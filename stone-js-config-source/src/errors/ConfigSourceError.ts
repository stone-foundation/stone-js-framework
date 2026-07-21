import { IntegrationError } from '@stone-js/core'
import type { ErrorOptions } from '@stone-js/core'

/**
 * Thrown when a config source cannot load, a driver SDK is missing, or a value cannot be parsed.
 */
export class ConfigSourceError extends IntegrationError {
  constructor (message: string, options: ErrorOptions = {}) {
    super(message, options)
    this.name = 'ConfigSourceError'
  }
}
