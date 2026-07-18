import { CliError } from '../src/errors/CliError'
import { OutgoingResponse } from '@stone-js/core'
import { ConsoleErrorHandler } from '../src/ConsoleErrorHandler'

describe('ConsoleErrorHandler', () => {
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
