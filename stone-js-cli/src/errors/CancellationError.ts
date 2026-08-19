import { CliError } from './CliError'
import { ErrorOptions } from '@stone-js/core'

/**
 * Raised when the user deliberately stops a prompt-driven command.
 *
 * Cancellation travels as an error because it has to unwind the command it interrupts, but it is
 * **not** a failure: nothing went wrong, the user simply decided not to proceed. Distinguishing it
 * by type is what lets each layer treat it as the successful outcome it is, without matching on a
 * message string, which would break the moment the wording changes or the output is translated.
 *
 * Extends {@link CliError} so anything already handling CLI errors keeps working; handlers that
 * care about the difference test for this type first.
 */
export class CancellationError extends CliError {
  /**
   * Creates a new instance of `CancellationError`.
   *
   * @param message - What to tell the user, in one calm line.
   * @param options - Optional additional error options.
   */
  constructor (message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'CancellationError'
  }
}
