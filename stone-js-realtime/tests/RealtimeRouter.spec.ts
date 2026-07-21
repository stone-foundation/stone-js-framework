import { RealtimeRouter } from '../src/RealtimeRouter'

describe('RealtimeRouter', () => {
  afterEach(() => { RealtimeRouter.setInstance(undefined) })

  it('registers handlers and reports keys/has', () => {
    const router = RealtimeRouter.create()
    router.register('connect', () => 'ok')
    expect(router.has('connect')).toBe(true)
    expect(router.keys()).toContain('connect')
  })

  it('dispatch returns undefined when no handler is registered (no-op)', async () => {
    const router = RealtimeRouter.create()
    expect(await router.dispatch('connect')).toBeUndefined()
  })

  it('dispatch invokes the registered handler with args', async () => {
    const router = RealtimeRouter.create()
    router.register('message', (message: any, connection: any) => ({ message, connection }))
    expect(await router.dispatch('message', 'hi', 'c1')).toEqual({ message: 'hi', connection: 'c1' })
  })

  it('exposes lifecycle helpers that dispatch reserved keys', async () => {
    const router = RealtimeRouter.create()
    const spy = vi.fn(() => 'r')
    router
      .register('connect', spy).register('disconnect', spy).register('message', spy)
      .register('error', spy).register('subscribe', spy).register('unsubscribe', spy)

    expect(await router.connect('c')).toBe('r')
    expect(await router.disconnect('c')).toBe('r')
    expect(await router.message('c')).toBe('r')
    expect(await router.error('c')).toBe('r')
    expect(await router.subscribe('c', 'room')).toBe('r')
    expect(await router.unsubscribe('c', 'room')).toBe('r')
    expect(spy).toHaveBeenCalledTimes(6)
  })

  it('event() dispatches the channel-event key', async () => {
    const router = RealtimeRouter.create()
    router.register('event:room:message', (payload: any) => payload)
    expect(await router.event('room', 'message', { text: 'hi' })).toEqual({ text: 'hi' })
    expect(await router.event('room', 'unknown')).toBeUndefined()
  })

  it('exposes a process-wide default instance', () => {
    expect(RealtimeRouter.getInstance()).toBeUndefined()
    const router = RealtimeRouter.create()
    RealtimeRouter.setInstance(router)
    expect(RealtimeRouter.getInstance()).toBe(router)
  })
})
