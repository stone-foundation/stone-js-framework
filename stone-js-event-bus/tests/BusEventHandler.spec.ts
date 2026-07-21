import { KeyRouter } from '@stone-js/key-router'
import { BusEventHandler } from '../src/BusEventHandler'

const blueprintWith = (listen: any): any => ({ get: (key: string, d: any) => (key === 'stone.eventBus.listen' ? listen : d) })
const event = (metadata: any): any => ({ get: (key: string, d: any) => (key === 'metadata' ? metadata : d) })

describe('BusEventHandler', () => {
  it('routes an incoming event to its @OnBusEvent handler (default source detail-type)', async () => {
    const router = KeyRouter.create()
    const spy = vi.fn(() => 'handled')
    router.register('order.shipped', spy)
    const handler = BusEventHandler.create({ blueprint: blueprintWith({}), eventBusRouter: router })

    const ev = event({ 'detail-type': 'order.shipped', detail: { id: 1 } })
    const result = await handler.handle(ev)

    expect(spy).toHaveBeenCalledWith({ id: 1 }, ev)
    expect(result).toBe('handled')
  })

  it('honours a configured source property', async () => {
    const router = KeyRouter.create()
    const spy = vi.fn()
    router.register('order.shipped', spy)
    const handler = BusEventHandler.create({ blueprint: blueprintWith({ source: 'type' }), eventBusRouter: router })
    await handler.handle(event({ type: 'order.shipped', detail: { id: 2 } }))
    expect(spy).toHaveBeenCalledWith({ id: 2 }, expect.anything())
  })

  it('honours a custom extractor', async () => {
    const router = KeyRouter.create()
    const spy = vi.fn()
    router.register('k', spy)
    const extractor = vi.fn(() => ({ key: 'k', payload: 'p' }))
    const handler = BusEventHandler.create({ blueprint: blueprintWith({ extractor }), eventBusRouter: router })
    await handler.handle(event({}))
    expect(extractor).toHaveBeenCalled()
    expect(spy).toHaveBeenCalledWith('p', expect.anything())
  })

  it('is a no-op for an unroutable key or an unregistered handler', async () => {
    const router = KeyRouter.create()
    const handler = BusEventHandler.create({ blueprint: blueprintWith({}), eventBusRouter: router })
    expect(await handler.handle(event({}))).toBeUndefined() // no key
    expect(await handler.handle(event({ 'detail-type': 'unknown' }))).toBeUndefined() // no handler
  })
})
