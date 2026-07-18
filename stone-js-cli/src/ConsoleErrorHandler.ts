import { CliError } from './errors/CliError'
import { ConsoleContext } from './declarations'
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
    this.context.commandOutput.error(error.message)
    return OutgoingResponse.create({ statusCode: 1 })
  }
}
