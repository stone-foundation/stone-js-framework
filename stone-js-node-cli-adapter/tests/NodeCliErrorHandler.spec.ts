import { NodeCliErrorHandler } from '../src/NodeCliErrorHandler'
import { AdapterErrorContext, ILogger, IBlueprint } from '@stone-js/core'

describe('NodeCliErrorHandler', () => {
  let mockLogger: ILogger
  let mockBlueprint: IBlueprint
  let handler: NodeCliErrorHandler
  let mockContext: AdapterErrorContext<any, any, any>

  beforeEach(() => {
    mockLogger = {
      error: vi.fn()
    } as unknown as ILogger

    mockBlueprint = {
      get: () => () => mockLogger
    } as unknown as IBlueprint

    mockContext = {
      rawEvent: {},
      rawResponseBuilder: {
        add: vi.fn().mockReturnThis(),
        build: vi.fn().mockReturnValue({
          respond: vi.fn().mockReturnValue(500)
        })
      }
    } as unknown as AdapterErrorContext<any, any, any>

    handler = new NodeCliErrorHandler({ blueprint: mockBlueprint })
  })

  test('should handle an error and return a response with correct headers', async () => {
    const error = new Error('Something went wrong')

    const response = await handler.handle(error, mockContext)

    expect(mockContext.rawResponseBuilder.add).toHaveBeenCalledWith(
      'exitCode',
      500
    )
    expect(mockLogger.error).toHaveBeenCalledWith('Something went wrong', { error })
    expect(response.build().respond()).toBe(500)
  })
})
