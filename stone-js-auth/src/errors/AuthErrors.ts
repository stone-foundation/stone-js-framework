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
 * Thrown when an authenticated principal lacks a required scope. Carries `statusCode = 403`.
 *
 * Named for what happened rather than for the category it belongs to. It used to be
 * `AuthorizationError`, which `@stone-js/authz` also exports for a policy denial — two packages, one
 * name, and an application mapping errors had to map both and hope it had guessed which was which.
 * Both throw sites here say "missing required scope", so this says it too.
 */
export class InsufficientScopeError extends IntegrationError {
  readonly statusCode = 403

  constructor (message: string, options: ErrorOptions = {}) {
    super(message, options)
    this.name = 'InsufficientScopeError'
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
