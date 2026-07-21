import { NextMiddleware } from '@stone-js/core'
import { AlibabaFcAdapterError } from '../../src/errors/AlibabaFcAdapterError'
import { IncomingEventMiddleware } from '../../src/middleware/IncomingEventMiddleware'
import { AlibabaFcAdapterContext, AlibabaFcAdapterResponseBuilder } from '../../src/declarations'

describe('IncomingEventMiddleware', () => {
  let middleware: IncomingEventMiddleware
  let mockContext: AlibabaFcAdapterContext
  let next: NextMiddleware<AlibabaFcAdapterContext, AlibabaFcAdapterResponseBuilder>

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
    } as unknown as AlibabaFcAdapterContext

    next = vi.fn()
  })

  it('should throw error if context is missing rawEvent or incomingEventBuilder', async () => {
    // @ts-expect-error
    mockContext.rawEvent = undefined

    await expect(middleware.handle(mockContext, next)).rejects.toThrow(AlibabaFcAdapterError)

    // @ts-expect-error
    mockContext.rawEvent = { foo: 'bar' } as any
    // @ts-expect-error
    mockContext.incomingEventBuilder = undefined

    await expect(middleware.handle(mockContext, next)).rejects.toThrow(AlibabaFcAdapterError)
  })

  it('should call next with the modified context', async () => {
    await middleware.handle(mockContext, next)

    expect(next).toHaveBeenCalledWith(mockContext)
    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('metadata', mockContext.rawEvent)
    // @ts-expect-error - Accessing private method for testing
    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('source', middleware.getSource(mockContext))
  })
})
