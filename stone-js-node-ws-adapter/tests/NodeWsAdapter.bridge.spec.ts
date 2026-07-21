import { IBlueprint, AdapterEventBuilder } from '@stone-js/core'
import { NodeWsAdapter } from '../src/NodeWsAdapter'
import { NodeWsAdapterError } from '../src/errors/NodeWsAdapterError'
import { RealtimeManager, RealtimeRouter, MemoryBroadcaster, ConnectionStore } from '@stone-js/realtime'

const makeBlueprint = (values: Record<string, any> = {}): IBlueprint => ({
  get: vi.fn((key: string, d: any) => (key in values ? values[key] : d)),
  set: vi.fn()
} as unknown as IBlueprint)

const fakeSocket = (): any => ({ send: vi.fn(), close: vi.fn(), on: vi.fn() })
const tick = async (): Promise<void> => { await new Promise((resolve) => setTimeout(resolve, 0)) }

describe('NodeWsAdapter (realtime bridge)', () => {
  let broadcaster: MemoryBroadcaster
  let router: RealtimeRouter
  let adapter: NodeWsAdapter

  beforeEach(() => {
    broadcaster = MemoryBroadcaster.create({ name: 'memory' })
    const manager = RealtimeManager.create('memory').register('memory', broadcaster)
    RealtimeManager.setInstance(manager)
    router = RealtimeRouter.create()
    RealtimeRouter.setInstance(router)
    adapter = NodeWsAdapter.create(makeBlueprint())
  })

  afterEach(() => { RealtimeManager.setInstance(undefined); RealtimeRouter.setInstance(undefined) })

  it('registers the connection, dispatches connect, wires events, and broadcast reaches the socket', async () => {
    const connectSpy = vi.fn()
    router.register('connect', connectSpy)
    const socket = fakeSocket()

    ;(adapter as any).handleConnection(socket)
    await tick()

    expect(socket.on).toHaveBeenCalledWith('message', expect.any(Function))
    expect(socket.on).toHaveBeenCalledWith('close', expect.any(Function))
    expect(socket.on).toHaveBeenCalledWith('error', expect.any(Function))
    expect(connectSpy).toHaveBeenCalledTimes(1)

    const connection = connectSpy.mock.calls[0][0]
    const store = (adapter as any).store() as ConnectionStore
    await store.subscribe(connection.id, 'room')
    await broadcaster.to('room').emit('ping', { n: 1 })
    expect(socket.send).toHaveBeenCalledWith(JSON.stringify({ channel: 'room', event: 'ping', payload: { n: 1 } }))
  })

  it('wired socket handlers drive error and close', async () => {
    const errorSpy = vi.fn()
    const disconnectSpy = vi.fn()
    router.register('error', errorSpy)
    router.register('disconnect', disconnectSpy)
    const socket = fakeSocket()

    ;(adapter as any).handleConnection(socket)
    await tick()
    const messageSpy = vi.fn()
    router.register('message', messageSpy)
    const handler = (name: string): any => socket.on.mock.calls.find((c: any[]) => c[0] === name)?.[1]

    handler('message')(JSON.stringify({ channel: 'room', event: 'x' }))
    handler('error')(new Error('boom'))
    handler('close')()
    await tick()

    expect(messageSpy).toHaveBeenCalled()
    expect(errorSpy).toHaveBeenCalled()
    expect(disconnectSpy).toHaveBeenCalled()
  })

  it('handleMessage: subscribe frame updates presence and dispatches to the router', async () => {
    const subSpy = vi.fn()
    router.register('subscribe', subSpy)
    const store = (adapter as any).store() as ConnectionStore
    const storeSpy = vi.spyOn(store, 'subscribe')
    const connection = { id: 'conn_1' }

    await (adapter as any).handleMessage(fakeSocket(), connection, JSON.stringify({ type: 'subscribe', channel: 'room' }))

    expect(storeSpy).toHaveBeenCalledWith('conn_1', 'room')
    expect(subSpy).toHaveBeenCalledWith('room', connection)
  })

  it('handleMessage: unsubscribe frame updates presence and dispatches to the router', async () => {
    const unsubSpy = vi.fn()
    router.register('unsubscribe', unsubSpy)
    const store = (adapter as any).store() as ConnectionStore
    const storeSpy = vi.spyOn(store, 'unsubscribe')
    const connection = { id: 'conn_1' }

    await (adapter as any).handleMessage(fakeSocket(), connection, JSON.stringify({ type: 'unsubscribe', channel: 'room' }))

    expect(storeSpy).toHaveBeenCalledWith('conn_1', 'room')
    expect(unsubSpy).toHaveBeenCalledWith('room', connection)
  })

  it('handleMessage: data frame dispatches message + event, and skips the kernel by default', async () => {
    const msgSpy = vi.fn()
    const evtSpy = vi.fn()
    router.register('message', msgSpy)
    router.register('event:room:ping', evtSpy)
    const kernelSpy = vi.spyOn(adapter as any, 'dispatchToKernel')
    const connection = { id: 'conn_9' }

    await (adapter as any).handleMessage(fakeSocket(), connection, JSON.stringify({ channel: 'room', event: 'ping', payload: 1 }))

    expect(msgSpy).toHaveBeenCalledWith({ channel: 'room', event: 'ping', payload: 1 }, connection)
    expect(evtSpy).toHaveBeenCalledWith(1, connection)
    expect(kernelSpy).not.toHaveBeenCalled()
  })

  it('handleMessage: dispatches to the kernel and sends the response back when enabled', async () => {
    const enabled = NodeWsAdapter.create(makeBlueprint({ 'stone.adapter.dispatchToKernel': true }))
    vi.spyOn(enabled as any, 'dispatchToKernel').mockResolvedValue({ content: { ok: true } })
    const socket = fakeSocket()

    await (enabled as any).handleMessage(socket, { id: 'c' }, JSON.stringify({ channel: 'room', event: 'ping' }))

    expect(socket.send).toHaveBeenCalledWith(JSON.stringify({ ok: true }))
  })

  it('handleMessage: dispatches an error on a malformed frame', async () => {
    const errSpy = vi.fn()
    router.register('error', errSpy)

    await (adapter as any).handleMessage(fakeSocket(), { id: 'c' }, 'garbage')

    expect(errSpy).toHaveBeenCalled()
    expect(errSpy.mock.calls[0][0]).toBeInstanceOf(NodeWsAdapterError)
  })

  it('handleClose removes the connection and dispatches disconnect', async () => {
    const discSpy = vi.fn()
    router.register('disconnect', discSpy)
    const store = (adapter as any).store() as ConnectionStore
    const removeSpy = vi.spyOn(store, 'remove')
    const connection = { id: 'c1' }

    await (adapter as any).handleClose(connection)

    expect(removeSpy).toHaveBeenCalledWith('c1')
    expect(discSpy).toHaveBeenCalledWith(connection)
  })

  it('dispatchToKernel runs the kernel and sendResponse posts content back', async () => {
    const socket = fakeSocket()
    vi.spyOn(adapter as any, 'resolveEventHandler').mockReturnValue(vi.fn())
    vi.spyOn(adapter as any, 'executeEventHandlerHooks').mockResolvedValue(undefined)
    vi.spyOn(adapter as any, 'sendEventThroughDestination').mockResolvedValue({ content: { ok: true } })

    const response = await (adapter as any).dispatchToKernel({ channel: 'c', event: 'e' }, socket, { id: 'c' })
    expect(response).toEqual({ content: { ok: true } })

    ;(adapter as any).sendResponse(socket, response)
    expect(socket.send).toHaveBeenCalledWith(JSON.stringify({ ok: true }))
  })

  it('dispatchToKernel wires the incoming-event and raw-response resolvers', async () => {
    const createSpy = vi.spyOn(AdapterEventBuilder, 'create').mockImplementation(({ resolver }: any) => resolver({}))
    vi.spyOn(adapter as any, 'resolveEventHandler').mockReturnValue(vi.fn())
    vi.spyOn(adapter as any, 'executeEventHandlerHooks').mockResolvedValue(undefined)
    vi.spyOn(adapter as any, 'sendEventThroughDestination').mockResolvedValue({})

    await (adapter as any).dispatchToKernel({ channel: 'c' }, fakeSocket(), { id: 'c' })

    expect(createSpy).toHaveBeenCalledTimes(2)
    createSpy.mockRestore()
  })

  it('dispatchToKernel builds a response on the error path', async () => {
    vi.spyOn(adapter as any, 'resolveEventHandler').mockImplementation(() => { throw new Error('x') })
    vi.spyOn(adapter as any, 'handleError').mockResolvedValue(vi.fn())
    vi.spyOn(adapter as any, 'buildRawResponse').mockResolvedValue({ statusCode: 500 })

    const response = await (adapter as any).dispatchToKernel({}, fakeSocket(), { id: 'c' })
    expect(response).toEqual({ statusCode: 500 })
  })

  it('sendResponse does nothing without content', () => {
    const socket = fakeSocket()
    ;(adapter as any).sendResponse(socket, { statusCode: 204 })
    expect(socket.send).not.toHaveBeenCalled()
  })
})

describe('NodeWsAdapter without realtime', () => {
  beforeEach(() => { RealtimeManager.setInstance(undefined); RealtimeRouter.setInstance(undefined) })

  it('router() and store() are undefined, and handleConnection still wires the socket', async () => {
    const adapter = NodeWsAdapter.create(makeBlueprint())
    expect((adapter as any).router()).toBeUndefined()
    expect((adapter as any).store()).toBeUndefined()

    const socket = fakeSocket()
    expect(() => (adapter as any).handleConnection(socket)).not.toThrow()
    expect(socket.on).toHaveBeenCalledWith('message', expect.any(Function))
    // a data frame without realtime just no-ops the router calls
    await (adapter as any).handleMessage(socket, { id: 'c' }, JSON.stringify({ channel: 'room', event: 'ping' }))
  })
})
