import { IBlueprint, AdapterEventBuilder } from '@stone-js/core'
import { NodeWsAdapter } from '../src/NodeWsAdapter'
import { NodeWsAdapterError } from '../src/errors/NodeWsAdapterError'
import { RealtimeManager, MemoryBroadcaster, ConnectionStore, eventKey } from '@stone-js/realtime'

const makeBlueprint = (values: Record<string, any> = {}): IBlueprint => ({
  get: vi.fn((key: string, d: any) => (key in values ? values[key] : d)),
  set: vi.fn()
} as unknown as IBlueprint)

const fakeSocket = (): any => ({ send: vi.fn(), close: vi.fn(), on: vi.fn() })
const tick = async (): Promise<void> => { await new Promise((resolve) => setTimeout(resolve, 0)) }

describe('NodeWsAdapter (realtime bridge, kernel-routed)', () => {
  let broadcaster: MemoryBroadcaster
  let adapter: NodeWsAdapter

  beforeEach(() => {
    broadcaster = MemoryBroadcaster.create({ name: 'memory' })
    RealtimeManager.setInstance(RealtimeManager.create('memory').register('memory', broadcaster))
    adapter = NodeWsAdapter.create(makeBlueprint())
  })

  afterEach(() => { RealtimeManager.setInstance(undefined) })

  it('registers the connection, dispatches connect, wires events, and broadcast reaches the socket', async () => {
    const dispatch = vi.spyOn(adapter as any, 'dispatch').mockResolvedValue(undefined)
    const socket = fakeSocket()

    ;(adapter as any).handleConnection(socket)
    await tick()

    expect(socket.on).toHaveBeenCalledWith('message', expect.any(Function))
    expect(socket.on).toHaveBeenCalledWith('close', expect.any(Function))
    expect(socket.on).toHaveBeenCalledWith('error', expect.any(Function))
    expect(dispatch).toHaveBeenCalledWith(socket, expect.objectContaining({ id: expect.any(String) }), 'connect')

    const connection = dispatch.mock.calls[0][1]
    const store = (adapter as any).store() as ConnectionStore
    await store.subscribe(connection.id, 'room')
    await broadcaster.to('room').emit('ping', { n: 1 })
    expect(socket.send).toHaveBeenCalledWith(JSON.stringify({ channel: 'room', event: 'ping', payload: { n: 1 } }))
  })

  it('wired socket handlers dispatch message/error/close through the kernel', async () => {
    const dispatch = vi.spyOn(adapter as any, 'dispatch').mockResolvedValue(undefined)
    const socket = fakeSocket()
    ;(adapter as any).handleConnection(socket)
    const handler = (name: string): any => socket.on.mock.calls.find((c: any[]) => c[0] === name)?.[1]

    handler('message')(JSON.stringify({ channel: 'room', event: 'x' }))
    handler('error')(new Error('boom'))
    handler('close')()
    await tick()

    expect(dispatch).toHaveBeenCalledWith(socket, expect.anything(), 'message', expect.objectContaining({ channel: 'room' }))
    expect(dispatch).toHaveBeenCalledWith(socket, expect.anything(), 'error', expect.any(Error))
    expect(dispatch).toHaveBeenCalledWith(socket, expect.anything(), 'disconnect')
  })

  it('handleMessage: subscribe frame updates presence and dispatches subscribe', async () => {
    const dispatch = vi.spyOn(adapter as any, 'dispatch').mockResolvedValue(undefined)
    const store = (adapter as any).store() as ConnectionStore
    const storeSpy = vi.spyOn(store, 'subscribe')
    const socket = fakeSocket()
    const connection = { id: 'conn_1' }

    await (adapter as any).handleMessage(socket, connection, JSON.stringify({ type: 'subscribe', channel: 'room' }))

    expect(storeSpy).toHaveBeenCalledWith('conn_1', 'room')
    expect(dispatch).toHaveBeenCalledWith(socket, connection, 'subscribe', 'room')
  })

  it('handleMessage: unsubscribe frame updates presence and dispatches unsubscribe', async () => {
    const dispatch = vi.spyOn(adapter as any, 'dispatch').mockResolvedValue(undefined)
    const store = (adapter as any).store() as ConnectionStore
    const storeSpy = vi.spyOn(store, 'unsubscribe')
    const socket = fakeSocket()
    const connection = { id: 'conn_1' }

    await (adapter as any).handleMessage(socket, connection, JSON.stringify({ type: 'unsubscribe', channel: 'room' }))

    expect(storeSpy).toHaveBeenCalledWith('conn_1', 'room')
    expect(dispatch).toHaveBeenCalledWith(socket, connection, 'unsubscribe', 'room')
  })

  it('handleMessage: data frame dispatches the raw message and the channel event', async () => {
    const dispatch = vi.spyOn(adapter as any, 'dispatch').mockResolvedValue(undefined)
    const socket = fakeSocket()
    const connection = { id: 'conn_9' }

    await (adapter as any).handleMessage(socket, connection, JSON.stringify({ channel: 'room', event: 'ping', payload: 1 }))

    expect(dispatch).toHaveBeenCalledWith(socket, connection, 'message', { channel: 'room', event: 'ping', payload: 1 })
    expect(dispatch).toHaveBeenCalledWith(socket, connection, eventKey('room', 'ping'), 1)
  })

  it('handleMessage: dispatches an error on a malformed frame', async () => {
    const dispatch = vi.spyOn(adapter as any, 'dispatch').mockResolvedValue(undefined)
    const socket = fakeSocket()

    await (adapter as any).handleMessage(socket, { id: 'c' }, 'garbage')

    expect(dispatch).toHaveBeenCalledWith(socket, { id: 'c' }, 'error', expect.any(NodeWsAdapterError))
  })

  it('handleClose removes the connection and dispatches disconnect', async () => {
    const dispatch = vi.spyOn(adapter as any, 'dispatch').mockResolvedValue(undefined)
    const store = (adapter as any).store() as ConnectionStore
    const removeSpy = vi.spyOn(store, 'remove')
    const socket = fakeSocket()
    const connection = { id: 'c1' }

    await (adapter as any).handleClose(socket, connection)

    expect(removeSpy).toHaveBeenCalledWith('c1')
    expect(dispatch).toHaveBeenCalledWith(socket, connection, 'disconnect')
  })
})

describe('NodeWsAdapter dispatch (kernel)', () => {
  const makeBp = (): IBlueprint => makeBlueprint()
  let adapter: NodeWsAdapter

  beforeEach(() => { adapter = NodeWsAdapter.create(makeBp()) })

  it('normalizes the socket event into an IncomingEvent and posts the kernel response back', async () => {
    const socket = fakeSocket()
    const connection = { id: 'c1' }
    let seenContext: any
    vi.spyOn(adapter as any, 'resolveEventHandler').mockReturnValue(vi.fn())
    vi.spyOn(adapter as any, 'executeEventHandlerHooks').mockResolvedValue(undefined)
    vi.spyOn(adapter as any, 'sendEventThroughDestination').mockImplementation(async (ctx: any) => { seenContext = ctx; return { content: { ok: true } } })

    await (adapter as any).dispatch(socket, connection, 'event:room:ping', { n: 1 })

    expect(seenContext.rawEvent).toEqual({ 'detail-type': 'event:room:ping', detail: { n: 1 }, connection })
    expect(socket.send).toHaveBeenCalledWith(JSON.stringify({ ok: true }))
  })

  it('wires the incoming-event and raw-response resolvers', async () => {
    const createSpy = vi.spyOn(AdapterEventBuilder, 'create').mockImplementation(({ resolver }: any) => resolver({}))
    vi.spyOn(adapter as any, 'resolveEventHandler').mockReturnValue(vi.fn())
    vi.spyOn(adapter as any, 'executeEventHandlerHooks').mockResolvedValue(undefined)
    vi.spyOn(adapter as any, 'sendEventThroughDestination').mockResolvedValue({})

    await (adapter as any).dispatch(fakeSocket(), { id: 'c' }, 'connect')

    expect(createSpy).toHaveBeenCalledTimes(2)
    createSpy.mockRestore()
  })

  it('builds a response on the error path', async () => {
    const socket = fakeSocket()
    vi.spyOn(adapter as any, 'resolveEventHandler').mockImplementation(() => { throw new Error('x') })
    vi.spyOn(adapter as any, 'handleError').mockResolvedValue(vi.fn())
    vi.spyOn(adapter as any, 'buildRawResponse').mockResolvedValue({ content: { error: true } })

    await (adapter as any).dispatch(socket, { id: 'c' }, 'connect')

    expect(socket.send).toHaveBeenCalledWith(JSON.stringify({ error: true }))
  })

  it('sendResponse does nothing without content', () => {
    const socket = fakeSocket()
    ;(adapter as any).sendResponse(socket, { statusCode: 204 })
    expect(socket.send).not.toHaveBeenCalled()
  })
})

describe('NodeWsAdapter without realtime', () => {
  beforeEach(() => { RealtimeManager.setInstance(undefined) })

  it('store() is undefined and handleConnection still wires the socket', () => {
    const adapter = NodeWsAdapter.create(makeBlueprint())
    vi.spyOn(adapter as any, 'dispatch').mockResolvedValue(undefined)
    expect((adapter as any).store()).toBeUndefined()

    const socket = fakeSocket()
    expect(() => (adapter as any).handleConnection(socket)).not.toThrow()
    expect(socket.on).toHaveBeenCalledWith('message', expect.any(Function))
  })
})
