import { NodeWsErrorHandler } from '../src/NodeWsErrorHandler'
import { AdapterErrorContext, ILogger, IBlueprint } from '@stone-js/core'

describe('NodeWsErrorHandler', () => {
  let mockLogger: ILogger
  let mockBlueprint: IBlueprint
  let handler: NodeWsErrorHandler
  let mockContext: AdapterErrorContext<any, any, any>

  beforeEach(() => {
    mockLogger = { error: vi.fn() } as unknown as ILogger
    mockBlueprint = { get: () => () => mockLogger } as unknown as IBlueprint
    mockContext = {
      rawEvent: {},
      rawResponseBuilder: { add: vi.fn().mockReturnThis() }
    } as unknown as AdapterErrorContext<any, any, any>
    handler = new NodeWsErrorHandler({ blueprint: mockBlueprint })
  })

  it('logs the error and builds a 500 error frame', () => {
    const error = new Error('boom')
    handler.handle(error, mockContext)
    expect(mockLogger.error).toHaveBeenCalledWith('boom', { error })
    expect(mockContext.rawResponseBuilder.add).toHaveBeenCalledWith('statusCode', 500)
    expect(mockContext.rawResponseBuilder.add).toHaveBeenCalledWith('content', { error: 'Internal error' })
  })
})
