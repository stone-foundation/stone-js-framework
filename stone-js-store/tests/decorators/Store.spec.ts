import { Store } from '../../src/decorators/Store'
import { defineStore } from '../../src/defineStore'
import { getBlueprint, hasBlueprint } from '@stone-js/core'
import { storeBlueprint } from '../../src/options/StoreBlueprint'
import { StoreServiceProvider } from '../../src/StoreServiceProvider'

const tasks = defineStore({ name: 'tasks', state: { items: [] as string[] } })

describe('@Store and storeBlueprint: the two activation paths', () => {
  it('declares exactly what its blueprint declares', () => {
    @Store()
    class Application {}

    expect(hasBlueprint(Application)).toBe(true)
    const blueprint: any = getBlueprint(Application, { stone: {} })

    expect(blueprint.stone.providers).toContain(StoreServiceProvider)
    expect(blueprint.stone.store.stores).toEqual([])
  })

  it('carries the stores it is given', () => {
    @Store({ stores: [tasks], snapshotKey: 'state' })
    class Application {}

    const blueprint: any = getBlueprint(Application, { stone: {} })

    expect(blueprint.stone.store.stores).toEqual([tasks])
    expect(blueprint.stone.store.snapshotKey).toBe('state')
  })

  it('does not leak between two decorated applications, nor mutate the shared constant', () => {
    @Store({ stores: [tasks] })
    class First {}

    @Store()
    class Second {}

    expect((getBlueprint(First, { stone: {} }) as any).stone.store.stores).toHaveLength(1)
    expect((getBlueprint(Second, { stone: {} }) as any).stone.store.stores).toEqual([])
    expect(storeBlueprint.stone.store.stores).toEqual([])
  })

  it('is the imperative counterpart, declaring the same provider', () => {
    expect(storeBlueprint.stone.providers).toEqual([StoreServiceProvider])
  })
})

describe('defineStore', () => {
  it('is a declaration, and per-request isolation is the default', () => {
    // The default matters more than the option: sharing state across SSR requests must be opted into,
    // never inherited by accident.
    expect(defineStore({ name: 'x', state: {} }).perRequest).toBeUndefined()
    expect(defineStore({ name: 'x', state: {}, perRequest: false }).perRequest).toBe(false)
  })
})
