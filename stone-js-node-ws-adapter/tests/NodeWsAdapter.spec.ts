import { IBlueprint } from '@stone-js/core'
import { NodeWsAdapter } from '../src/NodeWsAdapter'
import { NodeWsAdapterError } from '../src/errors/NodeWsAdapterError'

const makeBlueprint = (values: Record<string, any> = {}): IBlueprint => ({
  get: vi.fn((key: string, d: any) => (key in values ? values[key] : d)),
  set: vi.fn()
} as unknown as IBlueprint)

describe('NodeWsAdapter (lifecycle & server)', () => {
  it('creates an instance', () => {
    expect(NodeWsAdapter.create(makeBlueprint())).toBeInstanceOf(NodeWsAdapter)
  })

  it('throws when started outside a Node.js context', async () => {
    vi.stubGlobal('window', {})
    const adapter = NodeWsAdapter.create(makeBlueprint())
    await expect(adapter.run()).rejects.toThrow(NodeWsAdapterError)
    vi.unstubAllGlobals()
  })

  it('run() builds the server, wires connection/error handlers and returns it', async () => {
    const server = { on: vi.fn(), close: vi.fn() }
    const factory = vi.fn(() => server)
    const adapter = NodeWsAdapter.create(makeBlueprint({ 'stone.adapter.serverFactory': factory }))
    vi.spyOn(adapter as any, 'executeHooks').mockResolvedValue(undefined)

    const result = await adapter.run()

    expect(factory).toHaveBeenCalledWith(expect.objectContaining({ port: 8080, host: 'localhost' }))
    expect(server.on).toHaveBeenCalledWith('connection', expect.any(Function))
    expect(server.on).toHaveBeenCalledWith('error', expect.any(Function))
    expect(result).toBe(server)

    // the error handler logs (cover the arrow)
    const errorHandler = server.on.mock.calls.find((c: any[]) => c[0] === 'error')?.[1]
    expect(() => errorHandler(new Error('boom'))).not.toThrow()

    // the connection handler delegates to handleConnection (cover the arrow)
    vi.spyOn(adapter as any, 'dispatch').mockResolvedValue(undefined)
    const connectionHandler = server.on.mock.calls.find((c: any[]) => c[0] === 'connection')?.[1]
    const socket = { send: vi.fn(), close: vi.fn(), on: vi.fn() }
    expect(() => connectionHandler(socket)).not.toThrow()
    expect(socket.on).toHaveBeenCalledWith('message', expect.any(Function))
  })

  it('resolvePort uses the URL port, else defaults to 8080', () => {
    const withPort = NodeWsAdapter.create(makeBlueprint({ 'stone.adapter.url': 'ws://localhost:9001' }))
    const noPort = NodeWsAdapter.create(makeBlueprint({ 'stone.adapter.url': 'ws://localhost' }))
    expect((withPort as any).resolvePort()).toBe(9001)
    expect((noPort as any).resolvePort()).toBe(8080)
  })

  it('stop() closes the server and runs the stop hooks', async () => {
    const server = { on: vi.fn(), close: vi.fn((cb: () => void) => cb()) }
    const adapter = NodeWsAdapter.create(makeBlueprint({ 'stone.adapter.serverFactory': vi.fn(() => server) }))
    const hooks = vi.spyOn(adapter as any, 'executeHooks').mockResolvedValue(undefined)
    await adapter.run()
    await adapter.stop()
    expect(hooks).toHaveBeenCalledWith('onStop')
    expect(server.close).toHaveBeenCalled()
  })

  it('stop() asks every client to leave, because a connected one holds the server open', async () => {
    // Verified against the real `ws`: with a single client connected, `close(cb)` never calls back.
    // A realtime server is connected by definition, so `stop()` could not finish, which means a
    // deploy or a restart waited on it until something hard-killed the process.
    const client = { close: vi.fn(), terminate: vi.fn(), send: vi.fn(), on: vi.fn() }
    const server = { on: vi.fn(), close: vi.fn(), clients: new Set([client]) }
    const adapter = NodeWsAdapter.create(makeBlueprint({ 'stone.adapter.serverFactory': vi.fn(() => server) }))
    vi.spyOn(adapter as any, 'executeHooks').mockResolvedValue(undefined)
    await adapter.run()

    void adapter.stop()

    // 1001 is "going away", which a browser client reads as "reconnect later" rather than an error.
    await vi.waitFor(() => expect(client.close).toHaveBeenCalledWith(1001, 'Server shutting down'))
  })

  it('stop() finishes even when a client refuses to leave', async () => {
    vi.useFakeTimers()
    const client = { close: vi.fn(), terminate: vi.fn(), send: vi.fn(), on: vi.fn() }
    const server = { on: vi.fn(), close: vi.fn(), clients: new Set([client]) } // close never calls back
    const adapter = NodeWsAdapter.create(makeBlueprint({
      'stone.adapter.serverFactory': vi.fn(() => server),
      'stone.adapter.shutdownGracePeriod': 500
    }))
    vi.spyOn(adapter as any, 'executeHooks').mockResolvedValue(undefined)
    await adapter.run()

    const stopped = adapter.stop()
    await vi.advanceTimersByTimeAsync(500)
    await expect(stopped).resolves.toBeUndefined()

    expect(client.terminate).toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('stop() resolves even when no server was started', async () => {
    const adapter = NodeWsAdapter.create(makeBlueprint())
    vi.spyOn(adapter as any, 'executeHooks').mockResolvedValue(undefined)
    await expect(adapter.stop()).resolves.toBeUndefined()
  })
})

describe('NodeWsAdapter createServer (lazy ws)', () => {
  afterEach(() => { vi.doUnmock('ws'); vi.resetModules() })

  it('lazily imports ws and constructs a WebSocketServer', async () => {
    vi.resetModules()
    const instances: any[] = []
    const WebSocketServer = vi.fn(function (this: any, opts: any) { this.opts = opts; instances.push(this) })
    vi.doMock('ws', () => ({ WebSocketServer }))
    const { NodeWsAdapter: Fresh } = await import('../src/NodeWsAdapter')
    const adapter = Fresh.create(makeBlueprint({ 'stone.adapter.url': 'ws://localhost:8080' }))
    await (adapter as any).createServer()
    expect(WebSocketServer).toHaveBeenCalledWith(expect.objectContaining({ port: 8080, host: 'localhost' }))
  })

  it('throws a helpful error when ws is not installed', async () => {
    vi.resetModules()
    vi.doMock('ws', () => { throw new Error('Cannot find module ws') })
    const { NodeWsAdapter: Fresh } = await import('../src/NodeWsAdapter')
    const { NodeWsAdapterError: FreshError } = await import('../src/errors/NodeWsAdapterError')
    const adapter = Fresh.create(makeBlueprint())
    await expect((adapter as any).createServer()).rejects.toThrow(FreshError)
    await expect((adapter as any).createServer()).rejects.toThrow(/ws/)
  })
})
