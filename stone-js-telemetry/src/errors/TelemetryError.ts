import { ErrorOptions, RuntimeError } from '@stone-js/core'

/**
 * Error thrown by the telemetry module.
 */
export class TelemetryError extends RuntimeError {
  constructor (message: string, options: ErrorOptions = {}) {
    super(message, options)
    this.name = 'TelemetryError'
  }
}
