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

  it('should create an IncomingHttpEvent with defaults when rawEvent context is empty', async () => {
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


  it('decorates the response the kernel produced instead of discarding it', async () => {
    // The hook exists for requests that die before the kernel; it must not touch the ones that did
    // not. It used to hand `next` a brand-new 500 unconditionally, so a successful response was
    // replaced here by an empty one (`content: undefined`, `prepared: false`). The wire response
    // survived only because ServerResponseMiddleware had already copied the real one into the raw
    // builder and `addIf` will not overwrite a status; anything reading `context.outgoingResponse`
    // afterwards saw the empty 500.
    const real = OutgoingHttpResponse.create({ statusCode: 201, content: { id: 7 } })
    context.outgoingResponse = real
    context.incomingEvent = IncomingHttpEvent.create({
      source: {} as any, ip: '127.0.0.1', headers: {}, url: new URL('http://localhost/tasks'), method: 'POST'
    })

    await EnsureCorsHeadersHook({ context, blueprint })

    expect(context.outgoingResponse).toBe(real)
    expect(context.outgoingResponse.statusCode).toBe(201)
    expect(context.outgoingResponse.content).toEqual({ id: 7 })
    // The real status is what the builder is offered, so a later `addIf` cannot degrade it to 500.
    expect(rawResponseBuilder.addIf).toHaveBeenCalledWith('statusCode', 201)
  })

  it('still synthesizes a response when the request died before the kernel produced one', async () => {
    // The reason the hook exists: an adapter-level failure leaves nothing to answer with, and a
    // response with no CORS headers is an opaque network error in the browser rather than a status.
    await EnsureCorsHeadersHook({ context, blueprint })

    expect(context.outgoingResponse).toBeInstanceOf(OutgoingHttpResponse)
    expect(context.outgoingResponse.statusCode).toBe(500)
  })
})
