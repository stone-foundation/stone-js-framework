import { JwtClaims } from '../declarations'
import { AuthenticationError, AuthorizationError } from '../errors/AuthErrors'
import { IncomingEvent, NextMiddleware, OutgoingResponse, FunctionalMiddleware } from '@stone-js/core'

/**
 * Normalises a `scope` claim (space-delimited string or array) into an array.
 *
 * @param scope - The raw scope claim.
 * @returns The scopes.
 */
export function normalizeScopes (scope: unknown): string[] {
  if (Array.isArray(scope)) { return scope.map(String) }
  if (typeof scope === 'string') { return scope.split(/\s+/).filter((s) => s.length > 0) }
  return []
}

/**
 * Route guard requiring an authenticated request (a verified token).
 *
 * @returns A functional middleware that throws `AuthenticationError` (401) when anonymous.
 */
export function requireAuth (): FunctionalMiddleware<IncomingEvent, OutgoingResponse> {
  return async (event: IncomingEvent, next: NextMiddleware<IncomingEvent, OutgoingResponse>): Promise<OutgoingResponse> => {
    if (event.getMetadataValue('auth') === undefined) {
      throw new AuthenticationError('Authentication required.')
    }
    return await next(event)
  }
}

/**
 * Route guard requiring the authenticated principal to hold every given OAuth scope.
 *
 * @param required - The required scopes.
 * @returns A functional middleware that throws `AuthenticationError` (401) when anonymous or
 *          `AuthorizationError` (403) when a scope is missing.
 */
export function requireScopes (...required: string[]): FunctionalMiddleware<IncomingEvent, OutgoingResponse> {
  return async (event: IncomingEvent, next: NextMiddleware<IncomingEvent, OutgoingResponse>): Promise<OutgoingResponse> => {
    const claims = event.getMetadataValue<JwtClaims>('auth')

    if (claims === undefined) {
      throw new AuthenticationError('Authentication required.')
    }

    const granted = normalizeScopes(claims.scope)
    const missing = required.filter((scope) => !granted.includes(scope))

    if (missing.length > 0) {
      throw new AuthorizationError(`Missing required scope(s): ${missing.join(', ')}.`)
    }

    return await next(event)
  }
}
