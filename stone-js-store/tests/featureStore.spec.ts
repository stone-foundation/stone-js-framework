import { StateStore } from '../src/StateStore'
import { getBlueprint } from '@stone-js/core'
import { FeatureStore } from '../src/decorators/FeatureStore'
import { storeAlias, StoreServiceProvider } from '../src/StoreServiceProvider'
import { defineStore, isMetaStore, makeStore, MetaStore } from '../src/defineStore'

interface CompetitionState extends Record<string, any> { list: string[], selected?: string }

/** The use case the class form exists for: a feature's store, holding the client its actions call. */
class CompetitionStore extends StateStore<CompetitionState> {
  private readonly client: { list: () => string[] }

  constructor ({ competitionClient }: { competitionClient: { list: () => string[] } }) {
    super({ list: [] })
    this.client = competitionClient
  }

  load (): void {
    this.setState({ list: this.client.list() })
  }
}

const containerWith = (stores: any[], snapshot?: Record<string, unknown>): any => {
  const bindings: Record<string, { kind: string, build: () => any }> = {}
  const container: any = {
    bindings,
    competitionClient: { list: () => ['worlds', 'nationals'] },
    has: (key: string) => key === 'snapshot' && snapshot !== undefined,
    make: (key: string) => {
      if (key === 'blueprint') return { get: (_k: string, f: unknown) => ({ stores }) ?? f }
      if (key === 'snapshot') return { get: (k: string, f: unknown) => (snapshot as any)?.[k] ?? f }
      return bindings[key]?.build()
    },
    singletonIf: vi.fn((key: string, build: () => any) => { bindings[key] = { kind: 'singleton', build }; return container }),
    bindingIf: vi.fn((key: string, build: () => any) => { bindings[key] = { kind: 'binding', build }; return container })
  }
  return container
}

describe('a store written as a class', () => {
  it('is built by the container, so its actions can use injected services', () => {
    // The reason the form exists: a competition module has its client, its service and its store, and
    // the store's actions call the client. A data definition cannot say that.
    const container = containerWith([defineStore(CompetitionStore, { name: 'competition' })])
    new StoreServiceProvider(container).register()

    const store = container.make(storeAlias('competition')) as CompetitionStore
    store.load()

    expect(store.getState().list).toEqual(['worlds', 'nationals'])
  })

  it('is hydrated from the snapshot before anything reads it, like every other store', () => {
    const container = containerWith(
      [defineStore(CompetitionStore, { name: 'competition' })],
      { stores: { competition: { list: ['from-the-server'] } } }
    )
    new StoreServiceProvider(container).register()

    const store = container.make(storeAlias('competition')) as CompetitionStore

    expect(store.getState().list).toEqual(['from-the-server'])
  })

  it('keeps the per-request default, because the SSR leak does not care which form declared the store', () => {
    const container = containerWith([defineStore(CompetitionStore, { name: 'competition' })])
    new StoreServiceProvider(container).register()

    expect(container.bindings[storeAlias('competition')].kind).toBe('binding')
  })

  it('can opt into a process-wide lifetime, explicitly', () => {
    const container = containerWith([defineStore(CompetitionStore, { name: 'competition', perRequest: false })])
    new StoreServiceProvider(container).register()

    expect(container.bindings[storeAlias('competition')].kind).toBe('singleton')
  })
})

describe('a store written as a factory', () => {
  it('receives the container and returns the store', () => {
    const factory = (container: any): StateStore<CompetitionState> =>
      StateStore.create({ list: container.competitionClient.list() })
    const container = containerWith([defineStore(factory, { name: 'live', isFactory: true })])
    new StoreServiceProvider(container).register()

    const store = container.make(storeAlias('live')) as StateStore<CompetitionState>

    expect(store.getState().list).toEqual(['worlds', 'nationals'])
  })
})

describe('what defineStore declares, form by form', () => {
  it('leaves a data definition untouched, as it always has', () => {
    const declared = defineStore({ name: 'tasks', state: { items: [] } })

    expect(declared).toEqual({ name: 'tasks', state: { items: [] } })
    expect(isMetaStore(declared)).toBe(false)
  })

  it('wraps a class as a meta store, defaulting the name to the class name', () => {
    const declared = defineStore(CompetitionStore, {}) as MetaStore

    expect(declared).toMatchObject({ name: 'CompetitionStore', module: CompetitionStore, isClass: true })
  })

  it('refuses an anonymous factory with no name, loudly', () => {
    // A store is resolved and hydrated by name; a nameless one would register under `store.` and be
    // findable by nobody.
    expect(() => defineStore(() => StateStore.create({}), { isFactory: true })).toThrow(/needs a name/)
  })

  it('builds any form through makeStore, container in hand', () => {
    const fromData = makeStore({ name: 'a', state: { n: 1 } })
    const fromClass = makeStore(
      defineStore(CompetitionStore, { name: 'c' }),
      { competitionClient: { list: () => [] } }
    )

    expect(fromData.getState()).toEqual({ n: 1 })
    expect(fromClass.getState()).toEqual({ list: [] })
  })
})

describe('the @FeatureStore declaration', () => {
  it('registers the class and activates the module, in one gesture', () => {
    // The pattern every declaration decorator follows: declaring a store is the whole setup.
    @FeatureStore('competition')
    class DecoratedStore extends StateStore<CompetitionState> {
      constructor () { super({ list: [] }) }
    }

    const blueprint: any = getBlueprint(DecoratedStore as any)

    expect(blueprint.stone.store.stores).toEqual([
      { name: 'competition', module: DecoratedStore, isClass: true, perRequest: undefined }
    ])
    // The module blueprint travels with it: its provider is what registers the store.
    expect(blueprint.stone.providers).toBeDefined()
  })

  it('falls back to the class name, like every declaration decorator', () => {
    @FeatureStore()
    class ScoresStore extends StateStore<Record<string, any>> {
      constructor () { super({}) }
    }

    expect((getBlueprint(ScoresStore as any) as any).stone.store.stores[0].name).toBe('ScoresStore')
  })

  it('carries the declared lifetime', () => {
    @FeatureStore('flags', { perRequest: false })
    class FlagsStore extends StateStore<Record<string, any>> {
      constructor () { super({}) }
    }

    expect((getBlueprint(FlagsStore as any) as any).stone.store.stores[0].perRequest).toBe(false)
  })
})

describe('against the real container, not a stand-in', () => {
  it('auto-wires the class store constructor by destructuring', async () => {
    // The claim the whole form rests on: the container is a proxy that resolves what a constructor
    // destructures. Proven here on the real one, because a stand-in that answers everything would
    // pass whether the claim holds or not.
    const { Container } = await import('@stone-js/service-container')
    const container: any = Container.create()
    container.instance('competitionClient', { list: () => ['real-worlds'] })
    container.instance('blueprint', {
      get: (_key: string, fallback: unknown) => ({ stores: [defineStore(CompetitionStore, { name: 'competition' })] }) ?? fallback
    })

    const { StoreServiceProvider } = await import('../src/StoreServiceProvider')
    new StoreServiceProvider(container).register()

    const store = container.make(storeAlias('competition')) as CompetitionStore
    store.load()

    expect(store.getState().list).toEqual(['real-worlds'])
  })
})
