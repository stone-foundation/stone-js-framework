import { IBlueprint, AdapterEventBuilder } from '@stone-js/core'
import { ApiGatewayWsAdapter } from '../src/ApiGatewayWsAdapter'
import { ApiGatewayWsBroadcaster } from '../src/ApiGatewayWsBroadcaster'
import { ApiGatewayWsAdapterError } from '../src/errors/ApiGatewayWsAdapterError'
import { RealtimeManager, MemoryBroadcaster, eventKey } from '@stone-js/realtime'

const makeBlueprint = (values: Record<string, any> = {}): IBlueprint => ({
  get: vi.fn((key: string, d: any) => (key in values ? values[key] : d)),
  set: vi.fn()
} as unknown as IBlueprint)

const fakeStore = (): any => ({
  add: vi.fn().mockResolvedValue(undefined),
  remove: vi.fn().mockResolvedValue(undefined),
  subscribe: vi.fn().mockResolvedValue(undefined),
  unsubscribe: vi.fn().mockResolvedValue(undefined),
  connectionsFor: vi.fn().mockResolvedValue([]),
  members: vi.fn().mockResolvedValue([])
})

const event = (eventType: string, body?: string): any => ({
  requestContext: { connectionId: 'c1', eventType, domainName: 'api.example.com', stage: 'prod' },
  body
})

describe('ApiGatewayWsAdapter (kernel-routed)', () => {
  let store: any
  let broadcaster: ApiGatewayWsBroadcaster
  let adapter: ApiGatewayWsAdapter

  beforeEach(() => {
    store = fakeStore()
    broadcaster = ApiGatewayWsBroadcaster.create({ store, management: () => ({ postToConnection: vi.fn() }) })
    RealtimeManager.setInstance(RealtimeManager.create('apigw-ws').register('apigw-ws', broadcaster).setDefaultConnection('apigw-ws'))
    adapter = ApiGatewayWsAdapter.create(makeBlueprint())
  })

  afterEach(() => { RealtimeManager.setInstance(undefined) })

  it('creates an instance', () => {
    expect(adapter).toBeInstanceOf(ApiGatewayWsAdapter)
  })

  it('throws when started outside a Lambda/Node context', async () => {
    vi.stubGlobal('window', {})
    await expect(adapter.run()).rejects.toThrow(ApiGatewayWsAdapterError)
    vi.unstubAllGlobals()
  })

  it('run() returns a handler that processes events', async () => {
    vi.spyOn(adapter as any, 'executeHooks').mockResolvedValue(undefined)
    const dispatch = vi.spyOn(adapter as any, 'dispatch').mockResolvedValue({ statusCode: 200 })
    const handler = await adapter.run()
    const response = await handler(event('CONNECT'), {})
    expect(response).toEqual({ statusCode: 200 })
    expect(store.add).toHaveBeenCalledWith({ id: 'c1' })
    expect(dispatch).toHaveBeenCalledWith({}, { id: 'c1' }, 'connect')
  })

  it('points the broadcaster at the event management endpoint', async () => {
    vi.spyOn(adapter as any, 'dispatch').mockResolvedValue({ statusCode: 200 })
    const useEndpoint = vi.spyOn(broadcaster, 'useEndpoint')
    await (adapter as any).eventListener(event('CONNECT'), {})
    expect(useEndpoint).toHaveBeenCalledWith('https://api.example.com/prod')
  })

  it('CONNECT adds the connection and dispatches connect', async () => {
    const dispatch = vi.spyOn(adapter as any, 'dispatch').mockResolvedValue({ statusCode: 200 })
    await (adapter as any).eventListener(event('CONNECT'), {})
    expect(store.add).toHaveBeenCalledWith({ id: 'c1' })
    expect(dispatch).toHaveBeenCalledWith({}, { id: 'c1' }, 'connect')
  })

  it('DISCONNECT removes the connection and dispatches disconnect', async () => {
    const dispatch = vi.spyOn(adapter as any, 'dispatch').mockResolvedValue({ statusCode: 200 })
    await (adapter as any).eventListener(event('DISCONNECT'), {})
    expect(store.remove).toHaveBeenCalledWith('c1')
    expect(dispatch).toHaveBeenCalledWith({}, { id: 'c1' }, 'disconnect')
  })

  it('MESSAGE subscribe frame updates presence and dispatches subscribe', async () => {
    const dispatch = vi.spyOn(adapter as any, 'dispatch').mockResolvedValue({ statusCode: 200 })
    const response = await (adapter as any).eventListener(event('MESSAGE', JSON.stringify({ type: 'subscribe', channel: 'room' })), {})
    expect(store.subscribe).toHaveBeenCalledWith('c1', 'room')
    expect(dispatch).toHaveBeenCalledWith({}, { id: 'c1' }, 'subscribe', 'room')
    expect(response).toEqual({ statusCode: 200 })
  })

  it('MESSAGE unsubscribe frame updates presence and dispatches unsubscribe', async () => {
    const dispatch = vi.spyOn(adapter as any, 'dispatch').mockResolvedValue({ statusCode: 200 })
    await (adapter as any).eventListener(event('MESSAGE', JSON.stringify({ type: 'unsubscribe', channel: 'room' })), {})
    expect(store.unsubscribe).toHaveBeenCalledWith('c1', 'room')
    expect(dispatch).toHaveBeenCalledWith({}, { id: 'c1' }, 'unsubscribe', 'room')
  })

  it('MESSAGE data frame dispatches the raw message and the channel event', async () => {
    const dispatch = vi.spyOn(adapter as any, 'dispatch').mockResolvedValue({ statusCode: 200 })
    await (adapter as any).eventListener(event('MESSAGE', JSON.stringify({ channel: 'room', event: 'ping', payload: 1 })), {})
    expect(dispatch).toHaveBeenCalledWith({}, { id: 'c1' }, 'message', { channel: 'room', event: 'ping', payload: 1 })
    expect(dispatch).toHaveBeenCalledWith({}, { id: 'c1' }, eventKey('room', 'ping'), 1)
  })

  it('MESSAGE malformed frame dispatches error and returns 400', async () => {
    const dispatch = vi.spyOn(adapter as any, 'dispatch').mockResolvedValue({ statusCode: 200 })
    const response = await (adapter as any).eventListener(event('MESSAGE', 'garbage'), {})
    expect(dispatch).toHaveBeenCalledWith({}, { id: 'c1' }, 'error', expect.any(ApiGatewayWsAdapterError))
    expect(response).toEqual({ statusCode: 400 })
  })

  it('an unknown event type is acked without dispatch', async () => {
    const dispatch = vi.spyOn(adapter as any, 'dispatch').mockResolvedValue({ statusCode: 200 })
    expect(await (adapter as any).eventListener(event('WHATEVER'), {})).toEqual({ statusCode: 200 })
    expect(dispatch).not.toHaveBeenCalled()
  })

  it('store() memoizes the resolved store', () => {
    const first = (adapter as any).store()
    const second = (adapter as any).store()
    expect(second).toBe(first)
    expect(first).toBe(store)
  })

  it('dispatch normalizes the event and runs the kernel', async () => {
    let seenContext: any
    vi.spyOn(adapter as any, 'resolveEventHandler').mockReturnValue(vi.fn())
    vi.spyOn(adapter as any, 'executeEventHandlerHooks').mockResolvedValue(undefined)
    vi.spyOn(adapter as any, 'sendEventThroughDestination').mockImplementation(async (ctx: any) => { seenContext = ctx; return { statusCode: 200 } })

    const response = await (adapter as any).dispatch({}, { id: 'c1' }, eventKey('room', 'ping'), { n: 1 })

    expect(response).toEqual({ statusCode: 200 })
    expect(seenContext.rawEvent).toEqual({ 'detail-type': 'event:room:ping', detail: { n: 1 }, connection: { id: 'c1' } })
  })

  it('dispatch wires the incoming-event and raw-response resolvers', async () => {
    const createSpy = vi.spyOn(AdapterEventBuilder, 'create').mockImplementation(({ resolver }: any) => resolver({}))
    vi.spyOn(adapter as any, 'resolveEventHandler').mockReturnValue(vi.fn())
    vi.spyOn(adapter as any, 'executeEventHandlerHooks').mockResolvedValue(undefined)
    vi.spyOn(adapter as any, 'sendEventThroughDestination').mockResolvedValue({})
    await (adapter as any).dispatch({}, { id: 'c1' }, 'connect')
    expect(createSpy).toHaveBeenCalledTimes(2)
    createSpy.mockRestore()
  })

  it('dispatch builds a response on the error path', async () => {
    vi.spyOn(adapter as any, 'resolveEventHandler').mockImplementation(() => { throw new Error('x') })
    vi.spyOn(adapter as any, 'handleError').mockResolvedValue(vi.fn())
    vi.spyOn(adapter as any, 'buildRawResponse').mockResolvedValue({ statusCode: 500 })
    expect(await (adapter as any).dispatch({}, { id: 'c1' }, 'connect')).toEqual({ statusCode: 500 })
  })
})

describe('ApiGatewayWsAdapter without realtime', () => {
  beforeEach(() => { RealtimeManager.setInstance(undefined) })

  it('store() is undefined and useEndpoint is a no-op without a domain', () => {
    const adapter = ApiGatewayWsAdapter.create(makeBlueprint())
    expect((adapter as any).store()).toBeUndefined()
    expect(() => (adapter as any).useEndpoint({ requestContext: { connectionId: 'c', eventType: 'CONNECT' } })).not.toThrow()
  })

  it('useEndpoint is a no-op when the broadcaster does not support it', () => {
    RealtimeManager.setInstance(RealtimeManager.create('memory').register('memory', MemoryBroadcaster.create({ name: 'memory' })))
    const adapter = ApiGatewayWsAdapter.create(makeBlueprint())
    expect(() => (adapter as any).useEndpoint({ requestContext: { connectionId: 'c', eventType: 'CONNECT', domainName: 'api.example.com', stage: 'prod' } })).not.toThrow()
    RealtimeManager.setInstance(undefined)
  })
})
