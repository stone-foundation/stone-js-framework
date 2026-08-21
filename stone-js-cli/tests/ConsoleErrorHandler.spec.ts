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
    // Reporting a failure now ends the process, so the runner is kept out of its way: fake timers
    // hold the scheduled exit, and switching back discards it instead of letting it fire late.
    vi.useFakeTimers()
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)
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
    exit.mockRestore()
    vi.useRealTimers()
  })

  it('leaves for real, instead of setting a code the process never gets to deliver', () => {
    // The defect this replaces: `stone build` failing after vite started printed its error, resolved
    // exit 1, and then hung forever, because the build tooling keeps the event loop alive. The
    // successful path already exits on purpose; the failing one has more reason to.
    vi.useFakeTimers()
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)
    const context: any = { commandOutput: { error: vi.fn() } }

    new ConsoleErrorHandler(context).handle(new CliError('boom'))
    vi.runAllTimers()

    expect(exit).toHaveBeenCalledWith(1)
    exit.mockRestore()
    vi.useRealTimers()
  })

  it('does not force a cancellation to exit, because nothing is holding it', () => {
    // Choosing not to proceed happens before any build tooling starts, and a prompt-driven command
    // ends on its own. Forcing an exit there would cut output it is still flushing.
    vi.useFakeTimers()
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)
    const context: any = { commandOutput: { error: vi.fn(), info: vi.fn() } }

    new ConsoleErrorHandler(context).handle(new CancellationError('Cancelled.'))
    vi.runAllTimers()

    expect(exit).not.toHaveBeenCalled()
    exit.mockRestore()
    vi.useRealTimers()
  })
})
