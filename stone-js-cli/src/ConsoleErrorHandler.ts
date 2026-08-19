import { CliError } from './errors/CliError'
import { ConsoleContext } from './declarations'
import { CancellationError } from './errors/CancellationError'
import { IErrorHandler, IncomingEvent, OutgoingResponse } from '@stone-js/core'

/**
 * Class representing an ConsoleErrorHandler.
 *
 * Kernel level error handler for CLI applications.
 */
export class ConsoleErrorHandler implements IErrorHandler<IncomingEvent> {
  /**
   * Create an ConsoleErrorHandler.
   *
   * @param context - The service container to manage dependencies.
  */
  constructor (private readonly context: ConsoleContext) {}

  /**
   * Handle an error.
   *
   * @param error - The error to handle.
   * @returns The outgoing http response.
   */
  public handle (error: CliError): OutgoingResponse {
    // Choosing not to proceed is a complete interaction, so it gets a neutral line and a clean
    // exit: `info` prints no `✖`, and a zero status stops npm from stacking a crash report and a
    // debug-log path on top of a decision the user made on purpose. Handled here rather than in
    // the command so it covers every prompt-driven command, and so no command needs the catch-all
    // that once made real failures exit `0`.
    if (error instanceof CancellationError) {
      this.context.commandOutput.info(error.message)
      return OutgoingResponse.create({ statusCode: 0 })
    }

    this.context.commandOutput.error(error.message)
    return OutgoingResponse.create({ statusCode: 1 })
  }
}
