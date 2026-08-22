import { IntegrationError } from '@stone-js/core'
import type { ErrorOptions } from '@stone-js/core'

/**
 * Raised when the limiter cannot be built or a rule makes no sense.
 *
 * Deliberately not a {@link RateLimitError}: that one is a refusal and answers `429`, which would tell
 * a caller to slow down about a missing package or a limiter nobody registered. A setup mistake is the
 * application's, not the caller's, and it reads as one.
 */
export class RateLimitConfigurationError extends IntegrationError {
  constructor (message: string, options: ErrorOptions = {}) {
    super(message, options)
    this.name = 'RateLimitConfigurationError'
  }
}
