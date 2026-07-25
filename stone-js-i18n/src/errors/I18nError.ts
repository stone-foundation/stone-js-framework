import { IntegrationError } from '@stone-js/core'
import type { ErrorOptions } from '@stone-js/core'

/**
 * Thrown on an i18n configuration/integration problem (e.g. a malformed resource bundle).
 * Platform-agnostic: it knows nothing about HTTP/CLI/browser.
 */
export class I18nError extends IntegrationError {
  /**
   * @param message - The error message.
   * @param options - The error options.
   */
  constructor (message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'I18nError'
  }
}
