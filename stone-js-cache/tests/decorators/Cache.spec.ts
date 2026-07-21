import { addBlueprint } from '@stone-js/core'
import { Cache } from '../../src/decorators/Cache'

/* eslint-disable @typescript-eslint/no-extraneous-class */

vi.mock('@stone-js/core', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    addBlueprint: vi.fn(() => {}),
    classDecoratorLegacyWrapper: vi.fn((fn: Function) => { fn(); return fn })
  }
})

const lastBlueprint = (): any => vi.mocked(addBlueprint).mock.calls.at(-1)?.[2]

describe('Cache (enable decorator)', () => {
  it('registers the provider and sets the driver as the default store', () => {
    Cache({ driver: 'memory' })(class {})
    const bp = lastBlueprint()
    expect(bp.stone.cache.default).toBe('memory')
    expect(bp.stone.cache.stores[0]).toMatchObject({ name: 'memory', driver: 'memory' })
    expect(bp.stone.providers).toHaveLength(1)
  })

  it('honours a custom store name', () => {
    Cache({ driver: 'redis', name: 'sessions', url: 'redis://x' })(class {})
    const bp = lastBlueprint()
    expect(bp.stone.cache.default).toBe('sessions')
    expect(bp.stone.cache.stores[0]).toMatchObject({ name: 'sessions', driver: 'redis', url: 'redis://x' })
  })

  it('defineCache builds a config fragment', async () => {
    const { defineCache } = await import('../../src/options/CacheBlueprint')
    expect(defineCache({ default: 'redis', stores: [] })).toEqual({ cache: { default: 'redis', stores: [] } })
  })
})
