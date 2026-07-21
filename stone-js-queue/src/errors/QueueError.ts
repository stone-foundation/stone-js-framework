import { IntegrationError } from '@stone-js/core'
import type { ErrorOptions } from '@stone-js/core'

/**
 * Thrown when the queue is misconfigured, a driver SDK is missing, or a job has no handler.
 */
export class QueueError extends IntegrationError {
  constructor (message: string, options: ErrorOptions = {}) {
    super(message, options)
    this.name = 'QueueError'
  }
}
