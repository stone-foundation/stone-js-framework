import { IBlueprint, AdapterEventBuilder } from '@stone-js/core'
import { ApiGatewayWsAdapter } from '../src/ApiGatewayWsAdapter'
import { ApiGatewayWsBroadcaster } from '../src/ApiGatewayWsBroadcaster'
import { ApiGatewayWsAdapterError } from '../src/errors/ApiGatewayWsAdapterError'
import { RealtimeManager, RealtimeRouter, MemoryBroadcaster } from '@stone-js/realtime'

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

describe('ApiGatewayWsAdapter', () => {
  let store: any
  let broadcaster: ApiGatewayWsBroadcaster
  let router: RealtimeRouter
  let adapter: ApiGatewayWsAdapter

  beforeEach(() => {
    store = fakeStore()
    broadcaster = ApiGatewayWsBroadcaster.create({ store, management: () => ({ postToConnection: vi.fn() }) })
    RealtimeManager.setInstance(RealtimeManager.create('apigw-ws').register('apigw-ws', broadcaster).setDefaultConnection('apigw-ws'))
    router = RealtimeRouter.create()
    RealtimeRouter.setInstance(router)
    adapter = ApiGatewayWsAdapter.create(makeBlueprint())
  })

  afterEach(() => { RealtimeManager.setInstance(undefined); RealtimeRouter.setInstance(undefined) })

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
    const connectSpy = vi.fn()
    router.register('connect', connectSpy)
    const handler = await adapter.run()
    const response = await handler(event('CONNECT'), {})
    expect(response).toEqual({ statusCode: 200 })
    expect(store.add).toHaveBeenCalledWith({ id: 'c1' })
    expect(connectSpy).toHaveBeenCalled()
  })

  it('points the broadcaster at the event management endpoint', async () => {
    const useEndpoint = vi.spyOn(broadcaster, 'useEndpoint')
    await (adapter as any).eventListener(event('CONNECT'), {})
    expect(useEndpoint).toHaveBeenCalledWith('https://api.example.com/prod')
  })

  it('CONNECT adds the connection and dispatches connect', async () => {
    const spy = vi.fn()
    router.register('connect', spy)
    await (adapter as any).eventListener(event('CONNECT'), {})
    expect(store.add).toHaveBeenCalledWith({ id: 'c1' })
    expect(spy).toHaveBeenCalledWith({ id: 'c1' })
  })

  it('DISCONNECT removes the connection and dispatches disconnect', async () => {
    const spy = vi.fn()
    router.register('disconnect', spy)
    await (adapter as any).eventListener(event('DISCONNECT'), {})
    expect(store.remove).toHaveBeenCalledWith('c1')
    expect(spy).toHaveBeenCalledWith({ id: 'c1' })
  })

  it('MESSAGE subscribe frame updates presence and dispatches subscribe', async () => {
    const spy = vi.fn()
    router.register('subscribe', spy)
    const response = await (adapter as any).eventListener(event('MESSAGE', JSON.stringify({ type: 'subscribe', channel: 'room' })), {})
    expect(store.subscribe).toHaveBeenCalledWith('c1', 'room')
    expect(spy).toHaveBeenCalledWith('room', { id: 'c1' })
    expect(response).toEqual({ statusCode: 200 })
  })

  it('MESSAGE unsubscribe frame updates presence and dispatches unsubscribe', async () => {
    const spy = vi.fn()
    router.register('unsubscribe', spy)
    await (adapter as any).eventListener(event('MESSAGE', JSON.stringify({ type: 'unsubscribe', channel: 'room' })), {})
    expect(store.unsubscribe).toHaveBeenCalledWith('c1', 'room')
    expect(spy).toHaveBeenCalledWith('room', { id: 'c1' })
  })

  it('MESSAGE data frame dispatches message + event, and skips the kernel by default', async () => {
    const msgSpy = vi.fn()
    const evtSpy = vi.fn()
    router.register('message', msgSpy)
    router.register('event:room:ping', evtSpy)
    const kernelSpy = vi.spyOn(adapter as any, 'dispatchToKernel')
    await (adapter as any).eventListener(event('MESSAGE', JSON.stringify({ channel: 'room', event: 'ping', payload: 1 })), {})
    expect(msgSpy).toHaveBeenCalled()
    expect(evtSpy).toHaveBeenCalledWith(1, { id: 'c1' })
    expect(kernelSpy).not.toHaveBeenCalled()
  })

  it('MESSAGE data frame runs the kernel when enabled', async () => {
    const enabled = ApiGatewayWsAdapter.create(makeBlueprint({ 'stone.adapter.dispatchToKernel': true }))
    const kernelSpy = vi.spyOn(enabled as any, 'dispatchToKernel').mockResolvedValue({ statusCode: 200 })
    await (enabled as any).eventListener(event('MESSAGE', JSON.stringify({ channel: 'room', event: 'ping' })), {})
    expect(kernelSpy).toHaveBeenCalled()
  })

  it('MESSAGE malformed frame dispatches error and returns 400', async () => {
    const errSpy = vi.fn()
    router.register('error', errSpy)
    const response = await (adapter as any).eventListener(event('MESSAGE', 'garbage'), {})
    expect(errSpy.mock.calls[0][0]).toBeInstanceOf(ApiGatewayWsAdapterError)
    expect(response).toEqual({ statusCode: 400 })
  })

  it('an unknown event type is acked', async () => {
    expect(await (adapter as any).eventListener(event('WHATEVER'), {})).toEqual({ statusCode: 200 })
  })

  it('store() memoizes the resolved store', () => {
    const first = (adapter as any).store()
    const second = (adapter as any).store()
    expect(second).toBe(first)
    expect(first).toBe(store)
  })

  it('dispatchToKernel runs the kernel and returns the raw response', async () => {
    vi.spyOn(adapter as any, 'resolveEventHandler').mockReturnValue(vi.fn())
    vi.spyOn(adapter as any, 'executeEventHandlerHooks').mockResolvedValue(undefined)
    vi.spyOn(adapter as any, 'sendEventThroughDestination').mockResolvedValue({ statusCode: 200 })
    expect(await (adapter as any).dispatchToKernel(event('MESSAGE'), {})).toEqual({ statusCode: 200 })
  })

  it('dispatchToKernel wires the incoming-event and raw-response resolvers', async () => {
    const createSpy = vi.spyOn(AdapterEventBuilder, 'create').mockImplementation(({ resolver }: any) => resolver({}))
    vi.spyOn(adapter as any, 'resolveEventHandler').mockReturnValue(vi.fn())
    vi.spyOn(adapter as any, 'executeEventHandlerHooks').mockResolvedValue(undefined)
    vi.spyOn(adapter as any, 'sendEventThroughDestination').mockResolvedValue({})
    await (adapter as any).dispatchToKernel(event('MESSAGE'), {})
    expect(createSpy).toHaveBeenCalledTimes(2)
    createSpy.mockRestore()
  })

  it('dispatchToKernel builds a response on the error path', async () => {
    vi.spyOn(adapter as any, 'resolveEventHandler').mockImplementation(() => { throw new Error('x') })
    vi.spyOn(adapter as any, 'handleError').mockResolvedValue(vi.fn())
    vi.spyOn(adapter as any, 'buildRawResponse').mockResolvedValue({ statusCode: 500 })
    expect(await (adapter as any).dispatchToKernel(event('MESSAGE'), {})).toEqual({ statusCode: 500 })
  })
})

describe('ApiGatewayWsAdapter without realtime', () => {
  beforeEach(() => { RealtimeManager.setInstance(undefined); RealtimeRouter.setInstance(undefined) })

  it('router()/store() are undefined and useEndpoint is a no-op', async () => {
    const adapter = ApiGatewayWsAdapter.create(makeBlueprint())
    expect((adapter as any).router()).toBeUndefined()
    expect((adapter as any).store()).toBeUndefined()
    // a CONNECT with realtime absent still acks
    expect(await (adapter as any).eventListener(event('CONNECT'), {})).toEqual({ statusCode: 200 })
  })

  it('useEndpoint does nothing when the event has no domain', async () => {
    const adapter = ApiGatewayWsAdapter.create(makeBlueprint())
    expect(() => (adapter as any).useEndpoint({ requestContext: { connectionId: 'c', eventType: 'CONNECT' } })).not.toThrow()
  })

  it('useEndpoint is a no-op when the broadcaster does not support it', () => {
    RealtimeManager.setInstance(RealtimeManager.create('memory').register('memory', MemoryBroadcaster.create({ name: 'memory' })))
    const adapter = ApiGatewayWsAdapter.create(makeBlueprint())
    expect(() => (adapter as any).useEndpoint({ requestContext: { connectionId: 'c', eventType: 'CONNECT', domainName: 'api.example.com', stage: 'prod' } })).not.toThrow()
    RealtimeManager.setInstance(undefined)
  })
})
