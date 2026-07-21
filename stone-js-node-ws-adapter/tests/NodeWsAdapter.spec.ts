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
