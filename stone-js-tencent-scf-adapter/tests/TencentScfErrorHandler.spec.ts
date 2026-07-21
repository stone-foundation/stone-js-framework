import { TencentScfErrorHandler } from '../src/TencentScfErrorHandler'
import { AdapterErrorContext, ILogger, IBlueprint } from '@stone-js/core'

describe('TencentScfErrorHandler', () => {
  let mockLogger: ILogger
  let mockBlueprint: IBlueprint
  let handler: TencentScfErrorHandler
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
          respond: vi.fn().mockReturnValue('response')
        })
      }
    } as unknown as AdapterErrorContext<any, any, any>

    handler = new TencentScfErrorHandler({ blueprint: mockBlueprint })
  })

  test('should handle an error and return a response with correct headers', () => {
    const error = new Error('Something went wrong')

    const response = handler.handle(error, mockContext)

    expect(mockContext.rawResponseBuilder.add).toHaveBeenCalledWith('statusCode', 500)
    expect(mockLogger.error).toHaveBeenCalledWith('Something went wrong', { error })
    expect(response.build().respond()).toBe('response')
  })
})
