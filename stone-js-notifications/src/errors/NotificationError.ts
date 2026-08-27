import { IntegrationError } from '@stone-js/core'
import type { ErrorOptions } from '@stone-js/core'

/**
 * Raised for a setup mistake, so a misconfigured application never looks like a failed delivery.
 *
 * The distinction earns its place here: a failed delivery is retried, and a channel that answered
 * "provider unavailable" to "no channel named that" would be retried forever, on work that cannot
 * succeed.
 */
export class NotificationConfigurationError extends IntegrationError {
  constructor (message: string, options: ErrorOptions = {}) {
    super(message, { code: 'NOTIFICATION_CONFIGURATION_ERROR', ...options })
    this.name = 'NotificationConfigurationError'
  }
}
