import { ConfigSource } from '../src/declarations'
import { ConfigSourceManager, loadConfigSources } from '../src/ConfigSourceManager'

const src = (name: string, config: Record<string, unknown>): ConfigSource => ({ name, load: vi.fn().mockResolvedValue(config) })

describe('ConfigSourceManager', () => {
  it('merges sources in order (later wins) and applies the transform', async () => {
    const manager = ConfigSourceManager.create(
      [src('a', { db: { url: 'a', port: 1 } }), src('b', { db: { url: 'b' } })],
      { transform: (v) => (typeof v === 'string' ? v.toUpperCase() : v) }
    )
    expect(await manager.load()).toEqual({ db: { url: 'B', port: 1 } })
  })

  it('add() appends a source', async () => {
    const manager = ConfigSourceManager.create([src('a', { a: 1 })]).add(src('b', { b: 2 }))
    expect(await manager.load()).toEqual({ a: 1, b: 2 })
  })

  it('loadInto merges into the blueprint at the root', async () => {
    const blueprint: any = { set: vi.fn() }
    await ConfigSourceManager.create([src('a', { a: 1 })]).loadInto(blueprint)
    expect(blueprint.set).toHaveBeenCalledWith({ a: 1 })
  })

  it('loadInto nests under a key when configured', async () => {
    const blueprint: any = { set: vi.fn() }
    await ConfigSourceManager.create([src('a', { a: 1 })], { key: 'app' }).loadInto(blueprint)
    expect(blueprint.set).toHaveBeenCalledWith('app', { a: 1 })
  })

  it('loadConfigSources loads straight into the blueprint', async () => {
    const blueprint: any = { set: vi.fn() }
    await loadConfigSources(blueprint, [src('a', { a: 1 })])
    expect(blueprint.set).toHaveBeenCalledWith({ a: 1 })
  })
})
