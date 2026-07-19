import { IntegrationError } from '@stone-js/core'
import type { ErrorOptions } from '@stone-js/core'

/**
 * Thrown when an authenticated principal is not allowed to perform an action.
 *
 * Carries `statusCode = 403` so any HTTP error handler maps it to `403 Forbidden`, while the
 * error itself stays platform-agnostic (usable on the frontend too).
 */
export class AuthorizationError extends IntegrationError {
  readonly statusCode = 403

  constructor (message: string, options: ErrorOptions = {}) {
    super(message, options)
    this.name = 'AuthorizationError'
  }
}
