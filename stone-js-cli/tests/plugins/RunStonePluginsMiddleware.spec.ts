import { StoneReporter } from '../../src/StoneReporter'
import { RunStonePluginsMiddleware } from '../../src/plugins/RunStonePluginsMiddleware'

vi.mock('@stone-js/filesystem', () => ({
  buildPath: vi.fn((...paths: string[]) => `/proj/.stone/${paths.join('/')}`)
}))

vi.mock('fs-extra', () => ({ default: { outputFileSync: vi.fn() } }))

const step = vi.fn()
vi.mock('../../src/StoneReporter', () => ({
  StoneReporter: { create: vi.fn(() => ({ step })) }
}))

const makeBlueprint = (): any => {
  const store = new Map<string, unknown>()
  const blueprint: any = {
    get: (key: string, fallback: unknown) => (store.has(key) ? store.get(key) : fallback),
    set: (key: string, value: unknown) => { store.set(key, value); return blueprint }
  }
  return blueprint
}

const makeContext = (loaded: unknown[], task: string | undefined = 'build'): any => {
  const blueprint = makeBlueprint()
  blueprint.set('stone.builder.loadedPlugins', loaded)
  return {
    blueprint,
    commandOutput: {},
    event: { getMetadataValue: vi.fn(() => task) }
  }
}

describe('RunStonePluginsMiddleware', () => {
  let next: any

  beforeEach(() => {
    vi.clearAllMocks()
    next = vi.fn(async (ctx: any) => ctx.blueprint)
  })

  it('is a no-op passthrough when no plugin was loaded', async () => {
    const context = makeContext([])

    await RunStonePluginsMiddleware(context, next)

    expect(StoneReporter.create).not.toHaveBeenCalled()
    expect(context.blueprint.get('stone.builder.pluginModules')).toBeUndefined()
    expect(next).toHaveBeenCalledWith(context)
  })

  it('runs onPrepare then onBundle and stashes the contributions', async () => {
    const order: string[] = []
    const onPrepare = vi.fn(async (ctx: any) => {
      order.push('prepare')
      ctx.addModule('./gen.mjs')
      ctx.addBlueprint("blueprint.set('a', 1)")
    })
    const onBundle = vi.fn(async () => { order.push('bundle') })
    const context = makeContext([{ plugin: { name: 'a', onPrepare, onBundle }, source: 'config' }])

    await RunStonePluginsMiddleware(context, next)

    expect(order).toEqual(['prepare', 'bundle'])
    expect(context.blueprint.get('stone.builder.pluginModules')).toEqual(['./gen.mjs'])
    expect(context.blueprint.get('stone.builder.pluginBlueprints')).toEqual(["blueprint.set('a', 1)"])
    expect(next).toHaveBeenCalled()
  })

  it('announces auto-discovered plugins but stays silent for config-declared ones', async () => {
    const context = makeContext([
      { plugin: { name: 'cfg' }, source: 'config' },
      { plugin: { name: '@stone-js/i18n' }, source: '@stone-js/i18n' }
    ])

    await RunStonePluginsMiddleware(context, next)

    expect(step).toHaveBeenCalledTimes(1)
    expect(step).toHaveBeenCalledWith('plugin @stone-js/i18n (auto-discovered from @stone-js/i18n)')
  })

  it('falls back to the build command when the task metadata is absent', async () => {
    const onPrepare = vi.fn()
    const context = makeContext([{ plugin: { name: 'a', onPrepare }, source: 'config' }], undefined)

    await RunStonePluginsMiddleware(context, next)

    expect(onPrepare).toHaveBeenCalledWith(expect.objectContaining({ command: 'build' }))
  })
})
