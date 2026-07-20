import { IntegrationError } from '@stone-js/core'
import type { ErrorOptions } from '@stone-js/core'

/**
 * Thrown when authentication fails (missing/invalid/expired token). Carries `statusCode = 401`
 * so any HTTP error handler maps it to `401 Unauthorized`, while the error itself stays agnostic.
 */
export class AuthenticationError extends IntegrationError {
  readonly statusCode = 401

  constructor (message: string, options: ErrorOptions = {}) {
    super(message, options)
    this.name = 'AuthenticationError'
  }
}

/**
 * Thrown when an authenticated principal lacks the required scope/permission. Carries
 * `statusCode = 403` for a `403 Forbidden`.
 */
export class AuthorizationError extends IntegrationError {
  readonly statusCode = 403

  constructor (message: string, options: ErrorOptions = {}) {
    super(message, options)
    this.name = 'AuthorizationError'
  }
}

/**
 * Thrown when the authenticator is misconfigured (no key/secret/JWKS).
 */
export class AuthConfigError extends IntegrationError {
  constructor (message: string, options: ErrorOptions = {}) {
    super(message, options)
    this.name = 'AuthConfigError'
  }
}
