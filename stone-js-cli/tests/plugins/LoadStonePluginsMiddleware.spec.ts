import { collectStonePlugins } from '../../src/plugins/loadPlugins'
import { LoadStonePluginsMiddleware } from '../../src/plugins/LoadStonePluginsMiddleware'

vi.mock('../../src/plugins/loadPlugins', () => ({
  collectStonePlugins: vi.fn()
}))

const makeBlueprint = (): any => {
  const store = new Map<string, unknown>()
  const blueprint: any = {
    get: (key: string, fallback: unknown) => (store.has(key) ? store.get(key) : fallback),
    set: (key: string, value: unknown) => { store.set(key, value); return blueprint }
  }
  return blueprint
}

describe('LoadStonePluginsMiddleware', () => {
  const collect = vi.mocked(collectStonePlugins)
  let next: any

  beforeEach(() => {
    vi.clearAllMocks()
    next = vi.fn(async (ctx: any) => ctx.blueprint)
  })

  it('reads config plugins and the auto-discovery flag, then stores the loaded plugins', async () => {
    const blueprint = makeBlueprint()
    blueprint.set('stone.builder.plugins', [{ name: 'a' }])
    blueprint.set('stone.builder.autoDiscoverPlugins', false)
    const loaded = [{ plugin: { name: 'a' }, source: 'config' }]
    collect.mockResolvedValue(loaded as any)

    await LoadStonePluginsMiddleware({ blueprint } as any, next)

    expect(collect).toHaveBeenCalledWith([{ name: 'a' }], false)
    expect(blueprint.get('stone.builder.loadedPlugins')).toBe(loaded)
    expect(next).toHaveBeenCalled()
  })

  it('defaults to an empty plugin list and auto-discovery enabled', async () => {
    const blueprint = makeBlueprint()
    collect.mockResolvedValue([])

    await LoadStonePluginsMiddleware({ blueprint } as any, next)

    expect(collect).toHaveBeenCalledWith([], true)
  })

  it('runs the collected plugins blueprint middleware on the shared context', async () => {
    const blueprint = makeBlueprint()
    const spy = vi.fn()
    const pluginMiddleware = {
      module: async (ctx: any, nextPipe: any) => {
        spy()
        ctx.blueprint.set('touched', true)
        return await nextPipe(ctx)
      }
    }
    collect.mockResolvedValue([{ plugin: { name: 'a', blueprintMiddleware: [pluginMiddleware] }, source: 'config' }] as any)

    await LoadStonePluginsMiddleware({ blueprint } as any, next)

    expect(spy).toHaveBeenCalled()
    expect(blueprint.get('touched')).toBe(true)
  })
})
