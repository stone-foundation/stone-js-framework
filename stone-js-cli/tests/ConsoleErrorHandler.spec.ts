import { CliError } from '../src/errors/CliError'
import { OutgoingResponse } from '@stone-js/core'
import { ConsoleErrorHandler } from '../src/ConsoleErrorHandler'
import { CancellationError } from '../src/errors/CancellationError'

describe('ConsoleErrorHandler', () => {
  it('reports a cancellation as the success it is, so the shell stays quiet', () => {
    // A zero status is what the adapter turns into exit `0`, which is what stops npm from adding a
    // crash report and a debug-log path to a decision the user made deliberately.
    const context: any = { commandOutput: { error: vi.fn(), info: vi.fn() } }

    const response = new ConsoleErrorHandler(context)
      .handle(new CancellationError('Operation cancelled. Nothing was created.'))

    expect(response.statusCode).toBe(0)
    expect(context.commandOutput.info).toHaveBeenCalledWith('Operation cancelled. Nothing was created.')
    // `error` would print a `✖`, which is the crash-shaped output this exists to remove.
    expect(context.commandOutput.error).not.toHaveBeenCalled()
  })

  it('should print the error message and return a response with statusCode 1', () => {
    const context: any = {
      commandOutput: {
        error: vi.fn()
      }
    }

    const error = new CliError('Something went wrong')
    const handler = new ConsoleErrorHandler(context)

    const response = handler.handle(error)

    expect(context.commandOutput.error).toHaveBeenCalledWith('Something went wrong')
    expect(response).toBeInstanceOf(OutgoingResponse)
    expect(response.statusCode).toBe(1)
  })
})
