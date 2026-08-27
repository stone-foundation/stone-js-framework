import { IntegrationError } from '@stone-js/core'
import type { ErrorOptions } from '@stone-js/core'

/** The code a refusal carries, for an application mapping it to its own error envelope. */
export const RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'

/** What a refusal carries, so a caller knows when to come back. */
export interface RateLimitErrorOptions extends ErrorOptions {
  /** Seconds to wait before retrying. */
  retryAfter: number
  /** Epoch ms at which the window resets. */
  resetAt: number
  /** The limit that was exceeded. */
  limit: number
}

/**
 * Raised when a caller has spent its budget.
 *
 * It declares its own status, `429`, because this module knows nothing about the platform answering:
 * the HTTP error handler honours a declared status, and a CLI or a queue consumer reads the error
 * itself. `Retry-After` travels with it, since a refusal that does not say when to come back invites
 * exactly the retry storm the limit exists to stop.
 */
export class RateLimitError extends IntegrationError {
  readonly statusCode = 429
  readonly statusMessage = 'Too Many Requests'
  readonly headers: Record<string, string>
  /** Seconds to wait before retrying. */
  readonly retryAfter: number
  /** Epoch ms at which the window resets. */
  readonly resetAt: number
  /** The limit that was exceeded. */
  readonly limit: number

  constructor (message: string, options: RateLimitErrorOptions) {
    // A stable code, so an application maps this to its own error envelope without importing the
    // class into its error handler: `error.code === 'RATE_LIMIT_EXCEEDED'` needs no dependency on
    // this package at the one place that should not have one.
    super(message, { code: RATE_LIMIT_EXCEEDED, ...options })
    this.name = 'RateLimitError'
    this.retryAfter = options.retryAfter
    this.resetAt = options.resetAt
    this.limit = options.limit
    this.headers = { 'Retry-After': String(options.retryAfter) }
  }
}
