import { IncomingHttpEvent } from '../../src/IncomingHttpEvent'
import { OutgoingHttpResponse } from '../../src/OutgoingHttpResponse'
import { EnsureCorsHeadersHook } from '../../src/hooks/EnsureCorsHeadersHook'

const MockedHandle = vi.fn(async (_event, fallback) => {
  return fallback()
})

class MockedHandleCorsMiddleware {
  handle = MockedHandle
}

vi.mock('../../src/middleware/HandleCorsMiddleware', () => {
  return {
    HandleCorsMiddleware: vi.fn().mockImplementation(() => {
      return new MockedHandleCorsMiddleware()
    })
  }
})

describe('EnsureCorsHeadersHook', () => {
  let context: any
  let blueprint: any
  let rawResponseBuilder: any

  beforeEach(() => {
    MockedHandle.mockClear()
    rawResponseBuilder = {
      options: {
        headers: { 'x-raw': 'raw' }
      },
      add: vi.fn().mockReturnThis(),
      addIf: vi.fn().mockReturnThis()
    }

    blueprint = {}

    context = {
      rawEvent: {
        method: 'GET',
        path: '/hello',
        headers: { 'x-from': 'client' },
        ip: '192.168.1.1'
      },
      rawResponseBuilder,
      blueprint,
      incomingEvent: undefined,
      outgoingResponse: undefined
    }
  })

  it('should do nothing if context is empty', async () => {
    await EnsureCorsHeadersHook({ context: undefined, blueprint })
    expect(MockedHandle).not.toHaveBeenCalled()
  })

  it('should create an IncomingHttpEvent from rawEvent if not present', async () => {
    await EnsureCorsHeadersHook({ context, blueprint })

    expect(context.incomingEvent).toBeInstanceOf(IncomingHttpEvent)
    expect(context.incomingEvent.url.pathname).toBe('/hello')
    expect(context.incomingEvent.ip).toBe('192.168.1.1')
  })

  it('should create an IncomingHttpEvent from rawEvent if not present', async () => {
    context.rawEvent = {
      requestContext: {
        http: {}
      }
    }
    await EnsureCorsHeadersHook({ context, blueprint })

    expect(context.incomingEvent).toBeInstanceOf(IncomingHttpEvent)
    expect(context.incomingEvent.url.pathname).toBe('/')
    expect(context.incomingEvent.ip).toBe('127.0.0.1')
  })

  it('should skip if context.incomingEvent is not an IncomingHttpEvent', async () => {
    context.incomingEvent = {}
    await EnsureCorsHeadersHook({ context, blueprint })
    expect(MockedHandle).not.toHaveBeenCalled()
  })

  it('should fallback and build a new OutgoingHttpResponse', async () => {
    await EnsureCorsHeadersHook({ context, blueprint })

    expect(context.outgoingResponse).toBeInstanceOf(OutgoingHttpResponse)
    expect(context.outgoingResponse.statusCode).toBe(500)

    expect(rawResponseBuilder.add).toHaveBeenCalledWith('headers', expect.any(Headers))
    expect(rawResponseBuilder.addIf).toHaveBeenCalledWith('statusCode', 500)
  })

  it('should merge Headers, Map, and Object headers correctly', async () => {
    // Case 1: Headers object
    rawResponseBuilder.options.headers = new Headers({ a: '1', b: '2' })
    await EnsureCorsHeadersHook({ context, blueprint })
    expect(rawResponseBuilder.add).toHaveBeenCalledWith('headers', expect.any(Headers))

    // Case 2: Map
    rawResponseBuilder.options.headers = new Map<string, string>([['c', '3']])
    await EnsureCorsHeadersHook({ context, blueprint })
    expect(rawResponseBuilder.add).toHaveBeenCalledWith('headers', expect.any(Headers))

    // Case 2.1: Map
    rawResponseBuilder.options.headers = new Map<string, string[]>([['c', ['3']]])
    await EnsureCorsHeadersHook({ context, blueprint })
    expect(rawResponseBuilder.add).toHaveBeenCalledWith('headers', expect.any(Headers))

    // Case 3: Object
    rawResponseBuilder.options.headers = { d: '4' }
    await EnsureCorsHeadersHook({ context, blueprint })
    expect(rawResponseBuilder.add).toHaveBeenCalledWith('headers', expect.any(Headers))

    // Case 3.1: Object
    rawResponseBuilder.options.headers = { d: ['4'] }
    await EnsureCorsHeadersHook({ context, blueprint })
    expect(rawResponseBuilder.add).toHaveBeenCalledWith('headers', expect.any(Headers))
  })
})
