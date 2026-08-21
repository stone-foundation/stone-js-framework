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

    // Then leave, deliberately. Setting an exit code assumes the loop will drain, and a build tool's
    // loop does not: vite, esbuild and rollup leave handles behind, which is why a successful build
    // already exits on purpose. Without the same gesture here a failed command printed the right
    // message, resolved the right code, and then hung forever, which in CI is worse than the failure
    // it was reporting. Unref'd, so a command that can end on its own still does.
    setImmediate(() => process.exit(1)).unref()

    return OutgoingResponse.create({ statusCode: 1 })
  }
}
