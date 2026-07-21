import { addBlueprint } from '@stone-js/core'
import { Realtime } from '../../src/decorators/Realtime'

vi.mock('@stone-js/core', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    addBlueprint: vi.fn(() => {}),
    classDecoratorLegacyWrapper: vi.fn((fn: Function) => { fn(); return fn })
  }
})

const lastBlueprint = (): any => vi.mocked(addBlueprint).mock.calls.at(-1)?.[2]

describe('Realtime (enable decorator)', () => {
  it('registers the provider and sets the driver as the default connection', () => {
    Realtime({ driver: 'memory' })(class {})
    const bp = lastBlueprint()
    expect(bp.stone.realtime.default).toBe('memory')
    expect(bp.stone.realtime.connections[0]).toMatchObject({ name: 'memory', driver: 'memory' })
    expect(bp.stone.realtime.url).toBeUndefined()
    expect(bp.stone.providers).toHaveLength(1)
  })

  it('honours a custom name and a client url (kept out of the connection options)', () => {
    Realtime({ driver: 'redis', name: 'rt', url: 'wss://x' })(class {})
    const bp = lastBlueprint()
    expect(bp.stone.realtime.default).toBe('rt')
    expect(bp.stone.realtime.url).toBe('wss://x')
    expect(bp.stone.realtime.connections[0]).not.toHaveProperty('url')
  })
})
