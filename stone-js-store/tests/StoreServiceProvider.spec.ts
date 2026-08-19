import { defineStore } from '../src/defineStore'
import { storeAlias, StoreServiceProvider } from '../src/StoreServiceProvider'

const tasks = defineStore({ name: 'tasks', state: { items: [] as string[], filter: 'all' } })
const flags = defineStore({ name: 'flags', state: { beta: false }, perRequest: false })

/**
 * A container recording how each store was bound, and a snapshot only when one is given, since a
 * browser-only app has none.
 */
const makeContainer = (stores: any[], snapshot?: Record<string, unknown>): any => {
  const bindings: Record<string, { kind: string, build: () => any }> = {}
  return {
    bindings,
    has: (key: string) => key === 'snapshot' && snapshot !== undefined,
    make: (key: string) => {
      if (key === 'blueprint') return { get: (_k: string, f: unknown) => ({ stores }) ?? f }
      if (key === 'snapshot') return { get: (k: string, f: unknown) => (snapshot as any)?.[k] ?? f }
      return bindings[key]?.build()
    },
    singletonIf: vi.fn(function (this: any, key: string, build: () => any) { bindings[key] = { kind: 'singleton', build }; return this }),
    bindingIf: vi.fn(function (this: any, key: string, build: () => any) { bindings[key] = { kind: 'binding', build }; return this })
  }
}

describe('StoreServiceProvider', () => {
  it('registers each store under a name a component can ask for', () => {
    const container = makeContainer([tasks])

    new StoreServiceProvider(container).register()

    expect(storeAlias('tasks')).toBe('store.tasks')
    expect(container.bindings['store.tasks']).toBeDefined()
    expect(container.bindings['store.tasks'].build().getState()).toEqual({ items: [], filter: 'all' })
  })

  it('isolates a per-request store, which is the SSR bug this closes', () => {
    // A module-level singleton leaks one visitor's state into the next visitor's page, and nothing in
    // development reveals it because there is only ever one request at a time.
    const container = makeContainer([tasks])

    new StoreServiceProvider(container).register()

    expect(container.bindings['store.tasks'].kind).toBe('binding')
    const first = container.make('store.tasks')
    first.setState({ items: ['visitor one'] })

    expect(container.make('store.tasks').getState().items).toEqual([])
  })

  it('shares a store declared process-wide', () => {
    const container = makeContainer([flags])

    new StoreServiceProvider(container).register()

    expect(container.bindings['store.flags'].kind).toBe('singleton')
  })

  it('hydrates from the snapshot at registration, before anything can render', () => {
    // Hydrating in an effect after the first render is what produces the flash of empty state that
    // every hand-rolled SSR integration suffers from.
    const container = makeContainer([tasks], { stores: { tasks: { items: ['from server'] } } })

    new StoreServiceProvider(container).register()

    expect(container.make('store.tasks').getState())
      .toEqual({ items: ['from server'], filter: 'all' })
  })

  it('reads the snapshot key it was configured with', () => {
    const container = makeContainer([tasks], { myKey: { tasks: { filter: 'done' } } })
    container.make = ((key: string) => key === 'blueprint'
      ? { get: () => ({ stores: [tasks], snapshotKey: 'myKey' }) }
      : key === 'snapshot' ? { get: (k: string, f: unknown) => (k === 'myKey' ? { tasks: { filter: 'done' } } : f) } : container.bindings[key]?.build()) as any

    new StoreServiceProvider(container).register()

    expect(container.bindings['store.tasks'].build().getState().filter).toBe('done')
  })

  it('works with no snapshot at all, which is every browser-only application', () => {
    const container = makeContainer([tasks])

    new StoreServiceProvider(container).register()

    expect(container.bindings['store.tasks'].build().getState()).toEqual({ items: [], filter: 'all' })
  })

  it('registers nothing when the application declared no store', () => {
    const container = makeContainer([])

    new StoreServiceProvider(container).register()

    expect(Object.keys(container.bindings)).toEqual([])
  })

  it('registers nothing when the bucket declares no stores key at all', () => {
    // `stone.store` exists as soon as the module is enabled; `stores` may not.
    const container = makeContainer([])
    container.make = ((key: string) => key === 'blueprint' ? { get: () => ({}) } : undefined) as any

    new StoreServiceProvider(container).register()

    expect(container.singletonIf).not.toHaveBeenCalled()
  })

  it('copes with a snapshot binding that answers nothing usable', () => {
    const container = makeContainer([tasks])
    container.has = (key: string) => key === 'snapshot'
    container.make = ((key: string) => {
      if (key === 'blueprint') return { get: () => ({ stores: [tasks] }) }
      if (key === 'snapshot') return {}          // present, but exposes no `get`
      return container.bindings[key]?.build()
    }) as any

    new StoreServiceProvider(container).register()

    expect(container.bindings['store.tasks'].build().getState()).toEqual({ items: [], filter: 'all' })
  })

  it('falls back to a singleton when the container cannot make plain bindings', () => {
    // Older containers expose only `singletonIf`; the store still registers rather than vanishing.
    const container = makeContainer([tasks])
    container.bindingIf = undefined

    new StoreServiceProvider(container).register()

    expect(container.bindings['store.tasks'].kind).toBe('singleton')
  })
})
