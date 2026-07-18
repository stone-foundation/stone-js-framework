import { networkInterfaces } from 'node:os'
import { AdapterEventBuilder } from '@stone-js/core'
import { IncomingHttpEvent } from '@stone-js/http-core'
import { NodeHttpAdapter } from '../src/NodeHttpAdapter'
import { createServer as createHttpsServer } from 'node:https'
import { ServerResponseWrapper } from '../src/ServerResponseWrapper'
import { createServer, IncomingMessage, ServerResponse } from 'node:http'

// Mocks
vi.mock('node:http', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    createServer: vi.fn(() => ({
      once: vi.fn().mockReturnThis(),
      listen: vi.fn((_, __, cb) => cb?.()),
      close: vi.fn(),
      on: vi.fn()
    }))
  }
})

vi.mock('node:https', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    createServer: vi.fn(() => ({
      once: vi.fn().mockReturnThis(),
      listen: vi.fn((_, __, cb) => cb?.()),
      close: vi.fn()
    }))
  }
})

vi.mock('node:os', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    networkInterfaces: vi.fn(() => ({
      eth0: [{ family: 'IPv4', address: '192.168.0.1', internal: false }]
    }))
  }
})

vi.mock('chalk', () => ({
  default: {
    red: (msg: string) => msg,
    green: (msg: string) => msg,
    white: (msg: string) => msg,
    gray: (msg: string) => msg,
    blue: (msg: string) => msg
  }
}))

vi.mock('connect', () => {
  return {
    default: () => {
      const app = (..._: any[]): void => {}
      app.use = vi.fn().mockReturnThis()
      return app
    }
  }
})

describe('NodeHttpAdapter', () => {
  let mockServer: any
  let blueprint: any

  beforeEach(() => {
    blueprint = {
      values: {},
      set: vi.fn((key, value) => {
        blueprint.values[key] = value
      }),
      get: vi.fn((key, fallback) => blueprint.values[key] ?? fallback),
      has: vi.fn((key) => key in blueprint.values),
      getAll: vi.fn(() => blueprint.values)
    }
    blueprint.set('stone.logger.resolver', () => ({
      info: vi.fn(),
      error: vi.fn()
    }))

    mockServer = {
      close: vi.fn((cb) => cb()),
      once: vi.fn().mockReturnThis(),
      listen: vi.fn((port, host, cb) => cb())
    }

    vi.mocked(createServer).mockReturnValue(mockServer)
    vi.mocked(createHttpsServer).mockReturnValue(mockServer)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should create instance and default to HTTP server', () => {
    const adapter = NodeHttpAdapter.create(blueprint)
    expect(adapter).toBeInstanceOf(NodeHttpAdapter)
  })

  it('should create HTTPS server if isSsl=true', () => {
    blueprint.set('stone.adapter.isSsl', true)
    const adapter = NodeHttpAdapter.create(blueprint)
    expect(adapter).toBeInstanceOf(NodeHttpAdapter)
  })

  it('should run server and resolve with server instance', async () => {
    const adapter = NodeHttpAdapter.create(blueprint)
    const server = await adapter.run()
    expect(server).toBeDefined()
  })

  it('should apply DoS hardening defaults to the server', () => {
    NodeHttpAdapter.create(blueprint)
    expect(mockServer.maxHeadersCount).toBe(100)
    expect(mockServer.headersTimeout).toBe(60_000)
    expect(mockServer.requestTimeout).toBe(300_000)
    expect(mockServer.keepAliveTimeout).toBe(5_000)
    expect(mockServer.maxRequestsPerSocket).toBeUndefined()
  })

  it('should let stone.adapter.server override hardening knobs', () => {
    blueprint.set('stone.adapter.server', { maxHeadersCount: 30, headersTimeout: 15_000, maxRequestsPerSocket: 200 })
    NodeHttpAdapter.create(blueprint)
    expect(mockServer.maxHeadersCount).toBe(30)
    expect(mockServer.headersTimeout).toBe(15_000)
    expect(mockServer.maxRequestsPerSocket).toBe(200)
  })

  it('should print URLs if printUrls=true', async () => {
    vi.mocked(networkInterfaces).mockReturnValue({ eth0: undefined })
    const logger = { info: vi.fn(), error: vi.fn() }
    blueprint.set('stone.adapter.printUrls', true)
    blueprint.set('stone.logger.resolver', () => logger)
    const adapter = NodeHttpAdapter.create(blueprint)
    await adapter.run()
    expect(logger.info).toHaveBeenCalled()
  })

  it('should throw error if window object exists', async () => {
    const adapter = NodeHttpAdapter.create(blueprint)
    Object.defineProperty(globalThis, 'window', { value: {}, configurable: true })
    // @ts-expect-error - private access
    await expect(adapter.onStart()).rejects.toThrow()
    delete (globalThis as any).window
  })

  it('should setup global error handlers and shutdown hook', async () => {
    const processOn = vi.spyOn(process, 'on')
    const adapter = NodeHttpAdapter.create(blueprint)
    // @ts-expect-error - private access
    await adapter.onStart()
    expect(processOn).toHaveBeenCalledWith('SIGINT', expect.any(Function))
    expect(processOn).toHaveBeenCalledWith('uncaughtException', expect.any(Function))
  })

  it('should handle incoming event errors and send response', async () => {
    const adapter = NodeHttpAdapter.create(blueprint)
    const req = new IncomingMessage(null as any)
    const res = new ServerResponse(req)

    IncomingHttpEvent.create = vi.fn()
    ServerResponseWrapper.create = vi.fn()
    AdapterEventBuilder.create = vi.fn(({ resolver }) => resolver({}))

    vi.spyOn<any, any>(adapter, 'resolveEventHandler').mockReturnValue({ handle: vi.fn() })
    vi.spyOn<any, any>(adapter, 'sendEventThroughDestination').mockResolvedValue(res)
    vi.spyOn<any, any>(adapter, 'executeEventHandlerHooks').mockResolvedValue(undefined)

    // @ts-expect-error - private access
    const result = await adapter.eventListener(req, res)

    expect(result).toBeInstanceOf(ServerResponse)
    expect(IncomingHttpEvent.create).toHaveBeenCalled()
    expect(AdapterEventBuilder.create).toHaveBeenCalled()
    expect(ServerResponseWrapper.create).toHaveBeenCalled()
  })

  it('should handle errors in eventListener and build raw response', async () => {
    const adapter = NodeHttpAdapter.create(blueprint)
    const req = new IncomingMessage(null as any)
    const res = new ServerResponse(req)

    vi.spyOn<any, any>(adapter, 'resolveEventHandler').mockImplementation(() => { throw new Error('test') })
    vi.spyOn<any, any>(adapter, 'handleError').mockResolvedValue({ respond: vi.fn().mockResolvedValue(res) })
    vi.spyOn<any, any>(adapter, 'buildRawResponse').mockResolvedValue(res)

    // @ts-expect-error - private access
    const result = await adapter.eventListener(req, res)

    req.emit('error', new Error('test'))
    res.emit('error', new Error('test'))

    expect(result).toBeInstanceOf(ServerResponse)
    // @ts-expect-error - private access
    expect(adapter.logger.error).toHaveBeenCalledTimes(2)
  })

  it('getNetworkUrl should return expected local IP', () => {
    const adapter = NodeHttpAdapter.create(blueprint)
    // @ts-expect-error - private access
    const result = adapter.getNetworkUrl(new URL('http://localhost:3000'))
    expect(result).toBe('http://192.168.0.1:3000/')
  })

  it('getNetworkUrl should not return expected local IP when there is no interfaces', () => {
    vi.mocked(networkInterfaces).mockReturnValue({ eth0: undefined })
    const adapter = NodeHttpAdapter.create(blueprint)
    // @ts-expect-error - private access
    const result = adapter.getNetworkUrl(new URL('http://localhost:3000'))
    expect(result).toBeUndefined()
  })

  it('should handle uncaught exceptions gracefully', () => {
    const adapter = NodeHttpAdapter.create(blueprint)

    const mockError = new Error('Uncaught exception')

    // @ts-expect-error
    adapter.setupGlobalErrorHandlers()

    process.emit('uncaughtException', mockError)

    // @ts-expect-error - private access
    expect(adapter.logger.error).toHaveBeenCalledWith(
      'Uncaught exception detected. Shutting down the server...',
      { error: mockError }
    )
  })

  it('should shutdown application on SIGINT', () => {
    const adapter = NodeHttpAdapter.create(blueprint)
    // @ts-expect-error - private access
    adapter.executeHooks = vi.fn()

    // @ts-expect-error
    adapter.setupShutdownHook()

    process.emit('SIGINT')

    // @ts-expect-error - private access
    expect(adapter.executeHooks).toHaveBeenCalledWith('onStop')
  })

  it('should log unhandled promise rejections', () => {
    const adapter = NodeHttpAdapter.create(blueprint)

    // @ts-expect-error
    adapter.setupGlobalErrorHandlers()

    const mockReason = 'Rejection reason'
    const mockPromise = Promise.resolve()

    process.emit('unhandledRejection', mockReason, mockPromise)

    // @ts-expect-error - private access
    expect(adapter.logger.error).toHaveBeenCalledWith(
      'Unhandled promise rejection detected.',
      { promise: String(mockPromise), reason: String(mockReason) }
    )
  })

  it('binds global/shutdown handlers only once (idempotent)', () => {
    const adapter: any = NodeHttpAdapter.create(blueprint)
    const onSpy = vi.spyOn(process, 'on')

    adapter.setupGlobalErrorHandlers()
    adapter.setupGlobalErrorHandlers() // second call must be a no-op
    adapter.setupShutdownHook() // guard already set → no-op

    // uncaughtException + unhandledRejection bound exactly once, no SIGINT/SIGTERM re-bind.
    expect(onSpy.mock.calls.filter(([e]) => e === 'uncaughtException')).toHaveLength(1)
    onSpy.mockRestore()
  })

  it('resolvePort falls back to the protocol default when the URL has no port', () => {
    blueprint.set('stone.adapter.url', 'https://localhost')
    const httpsAdapter: any = NodeHttpAdapter.create(blueprint)
    expect(httpsAdapter.resolvePort()).toBe(443)

    blueprint.set('stone.adapter.url', 'http://localhost')
    const httpAdapter: any = NodeHttpAdapter.create(blueprint)
    expect(httpAdapter.resolvePort()).toBe(80)

    blueprint.set('stone.adapter.url', 'http://localhost:3000')
    const explicit: any = NodeHttpAdapter.create(blueprint)
    expect(explicit.resolvePort()).toBe(3000)
  })
})
