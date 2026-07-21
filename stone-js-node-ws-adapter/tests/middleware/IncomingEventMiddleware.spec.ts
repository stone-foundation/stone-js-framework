import { NextMiddleware } from '@stone-js/core'
import { NodeWsAdapterError } from '../../src/errors/NodeWsAdapterError'
import { IncomingEventMiddleware } from '../../src/middleware/IncomingEventMiddleware'
import { NodeWsAdapterContext, NodeWsAdapterResponseBuilder } from '../../src/declarations'

describe('IncomingEventMiddleware', () => {
  let middleware: IncomingEventMiddleware
  let mockContext: NodeWsAdapterContext
  let next: NextMiddleware<NodeWsAdapterContext, NodeWsAdapterResponseBuilder>

  beforeEach(() => {
    middleware = new IncomingEventMiddleware()
    mockContext = {
      rawEvent: { channel: 'room', event: 'ping' },
      rawResponse: {},
      executionContext: { connectionId: 'conn_1' },
      incomingEventBuilder: { add: vi.fn().mockReturnThis() }
    } as unknown as NodeWsAdapterContext
    next = vi.fn()
  })

  it('throws when the context is missing required components', async () => {
    // @ts-expect-error
    mockContext.rawEvent = undefined
    await expect(middleware.handle(mockContext, next)).rejects.toThrow(NodeWsAdapterError)

    // @ts-expect-error
    mockContext.rawEvent = { foo: 'bar' }
    // @ts-expect-error
    mockContext.incomingEventBuilder = undefined
    await expect(middleware.handle(mockContext, next)).rejects.toThrow(NodeWsAdapterError)
  })

  it('adds metadata and source, then calls next', async () => {
    await middleware.handle(mockContext, next)
    expect(next).toHaveBeenCalledWith(mockContext)
    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('metadata', mockContext.rawEvent)
    // @ts-expect-error - private method for the assertion
    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('source', middleware.getSource(mockContext))
  })
})
