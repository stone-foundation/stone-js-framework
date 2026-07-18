import { ErrorOptions, RuntimeError } from '@stone-js/core'

/**
 * Represents an error specific to the Stone CLI.
 *
 * Extends `RuntimeError` to provide a custom error type for handling CLI-related issues.
 */
export class CliError extends RuntimeError {
  /**
   * Creates a new instance of `CliError`.
   *
   * @param message - The error message describing the issue.
   * @param options - Optional additional error options.
   */
  constructor (message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'CliError'
  }
}
