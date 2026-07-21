import { KeyRouter } from '@stone-js/key-router'
import { KeyRoutingError } from '../src/errors/KeyRoutingError'
import { KeyRoutingEventHandler } from '../src/KeyRoutingEventHandler'
import { DEFAULT_KEY_SOURCE, defaultExtractor } from '../src/keyRoutingDeclarations'

const blueprintWith = (config: any): any => ({ get: (key: string, d: any) => (key === 'stone.keyRouting' ? config : d) })
const event = (metadata: any): any => ({ get: (key: string, d: any) => (key === 'metadata' ? metadata : d) })

describe('defaultExtractor & constants', () => {
  it('exposes detail-type as the default key source', () => {
    expect(DEFAULT_KEY_SOURCE).toBe('detail-type')
  })

  it('reads the key from the source property and payload from detail', () => {
    const extract = defaultExtractor('detail-type')
    expect(extract(event({ 'detail-type': 'order.shipped', detail: { id: 1 } }))).toEqual({ key: 'order.shipped', payload: { id: 1 } })
  })

  it('falls back to metadata as payload, and undefined key when absent/non-string', () => {
    const extract = defaultExtractor('detail-type')
    const meta = { 'detail-type': 'x' }
    expect(extract(event(meta))).toEqual({ key: 'x', payload: meta })
    expect(extract(event({ 'detail-type': 5 })).key).toBeUndefined()
    expect(extract(event(undefined)).key).toBeUndefined()
  })
})

describe('KeyRoutingError', () => {
  it('is a named integration error', () => {
    expect(new KeyRoutingError('boom').name).toBe('KeyRoutingError')
  })
})

describe('KeyRoutingEventHandler', () => {
  it('routes an incoming event to its keyed handler (default source)', async () => {
    const router = KeyRouter.create()
    const spy = vi.fn(() => 'handled')
    router.register('order.shipped', spy)
    const handler = KeyRoutingEventHandler.create({ blueprint: blueprintWith({}), keyRouter: router })

    const ev = event({ 'detail-type': 'order.shipped', detail: { id: 1 } })
    expect(await handler.handle(ev)).toBe('handled')
    expect(spy).toHaveBeenCalledWith({ id: 1 }, ev)
  })

  it('honours a configured source and a custom extractor', async () => {
    const router = KeyRouter.create()
    const spy = vi.fn()
    router.register('k', spy)

    const bySource = KeyRoutingEventHandler.create({ blueprint: blueprintWith({ source: 'type' }), keyRouter: KeyRouter.create().register('k', spy) as any })
    await bySource.handle(event({ type: 'k' }))
    expect(spy).toHaveBeenCalledTimes(1)

    const extractor = vi.fn(() => ({ key: 'k', payload: 'p' }))
    const byExtractor = KeyRoutingEventHandler.create({ blueprint: blueprintWith({ extractor }), keyRouter: router })
    await byExtractor.handle(event({}))
    expect(extractor).toHaveBeenCalled()
    expect(spy).toHaveBeenCalledWith('p', expect.anything())
  })

  it('is a no-op for a missing key or unmatched handler by default', async () => {
    const handler = KeyRoutingEventHandler.create({ blueprint: blueprintWith({}), keyRouter: KeyRouter.create() })
    expect(await handler.handle(event({}))).toBeUndefined()
    expect(await handler.handle(event({ 'detail-type': 'nope' }))).toBeUndefined()
  })

  it('throws in strict mode for a missing key or unmatched handler', async () => {
    const handler = KeyRoutingEventHandler.create({ blueprint: blueprintWith({ strict: true }), keyRouter: KeyRouter.create() })
    await expect(handler.handle(event({}))).rejects.toThrow(KeyRoutingError)
    await expect(handler.handle(event({ 'detail-type': 'nope' }))).rejects.toThrow(/nope/)
  })
})
