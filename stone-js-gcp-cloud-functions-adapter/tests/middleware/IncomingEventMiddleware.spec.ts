import { NextMiddleware } from '@stone-js/core'
import { GcpCloudFunctionsAdapterError } from '../../src/errors/GcpCloudFunctionsAdapterError'
import { IncomingEventMiddleware } from '../../src/middleware/IncomingEventMiddleware'
import { GcpCloudFunctionsAdapterContext, GcpCloudFunctionsAdapterResponseBuilder } from '../../src/declarations'

describe('IncomingEventMiddleware', () => {
  let middleware: IncomingEventMiddleware
  let mockContext: GcpCloudFunctionsAdapterContext
  let next: NextMiddleware<GcpCloudFunctionsAdapterContext, GcpCloudFunctionsAdapterResponseBuilder>

  beforeEach(() => {
    middleware = new IncomingEventMiddleware()

    mockContext = {
      rawEvent: {
        name: 'Aws lambda'
      },
      rawResponse: {},
      incomingEventBuilder: {
        add: vi.fn().mockReturnThis()
      }
    } as unknown as GcpCloudFunctionsAdapterContext

    next = vi.fn()
  })

  it('should throw error if context is missing rawEvent or incomingEventBuilder', async () => {
    // @ts-expect-error
    mockContext.rawEvent = undefined

    await expect(middleware.handle(mockContext, next)).rejects.toThrow(GcpCloudFunctionsAdapterError)

    // @ts-expect-error
    mockContext.rawEvent = { foo: 'bar' } as any
    // @ts-expect-error
    mockContext.incomingEventBuilder = undefined

    await expect(middleware.handle(mockContext, next)).rejects.toThrow(GcpCloudFunctionsAdapterError)
  })

  it('should call next with the modified context', async () => {
    await middleware.handle(mockContext, next)

    expect(next).toHaveBeenCalledWith(mockContext)
    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('metadata', mockContext.rawEvent)
    // @ts-expect-error - Accessing private method for testing
    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('source', middleware.getSource(mockContext))
  })
})
