import { StoneReporter } from '../../src/StoneReporter'
import {
  RunStonePluginsPrepareMiddleware,
  RunStonePluginsBundleMiddleware
} from '../../src/plugins/RunStonePluginsMiddleware'

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

describe('RunStonePlugins middleware', () => {
  let next: any

  beforeEach(() => {
    vi.clearAllMocks()
    next = vi.fn(async (ctx: any) => ctx.blueprint)
  })

  describe('prepare phase', () => {
    it('is a no-op passthrough when no plugin was loaded', async () => {
      const context = makeContext([])
      await RunStonePluginsPrepareMiddleware(context, next)
      expect(StoneReporter.create).not.toHaveBeenCalled()
      expect(context.blueprint.get('stone.builder.pluginModules')).toBeUndefined()
      expect(next).toHaveBeenCalledWith(context)
    })

    it('runs onPrepare (not onBundle) and stashes the contributions', async () => {
      const onPrepare = vi.fn(async (ctx: any) => {
        ctx.addModule('./gen.mjs')
        ctx.addBlueprint("blueprint.set('a', 1)")
      })
      const onBundle = vi.fn()
      const context = makeContext([{ plugin: { name: 'a', onPrepare, onBundle }, source: 'config' }])

      await RunStonePluginsPrepareMiddleware(context, next)

      expect(onPrepare).toHaveBeenCalled()
      expect(onBundle).not.toHaveBeenCalled()
      expect(context.blueprint.get('stone.builder.pluginModules')).toEqual(['./gen.mjs'])
      expect(context.blueprint.get('stone.builder.pluginBlueprints')).toEqual(["blueprint.set('a', 1)"])
    })

    it('announces auto-discovered plugins but stays silent for config-declared ones', async () => {
      const context = makeContext([
        { plugin: { name: 'cfg' }, source: 'config' },
        { plugin: { name: '@stone-js/i18n' }, source: '@stone-js/i18n' }
      ])

      await RunStonePluginsPrepareMiddleware(context, next)

      expect(step).toHaveBeenCalledTimes(1)
      expect(step).toHaveBeenCalledWith('plugin @stone-js/i18n (auto-discovered from @stone-js/i18n)')
    })

    it('falls back to the build command when the task metadata is absent', async () => {
      const onPrepare = vi.fn()
      const context = makeContext([{ plugin: { name: 'a', onPrepare }, source: 'config' }], undefined)
      await RunStonePluginsPrepareMiddleware(context, next)
      expect(onPrepare).toHaveBeenCalledWith(expect.objectContaining({ command: 'build' }))
    })
  })

  describe('bundle phase', () => {
    it('runs onBundle (not onPrepare) without announcing', async () => {
      const onPrepare = vi.fn()
      const onBundle = vi.fn()
      const context = makeContext([{ plugin: { name: '@stone-js/x', onPrepare, onBundle }, source: '@stone-js/x' }])

      await RunStonePluginsBundleMiddleware(context, next)

      expect(onBundle).toHaveBeenCalled()
      expect(onPrepare).not.toHaveBeenCalled()
      expect(step).not.toHaveBeenCalled()
    })

    it('appends to the contributions already stashed by the prepare phase', async () => {
      const context = makeContext([{ plugin: { name: 'a', onBundle: (ctx: any) => ctx.addModule('./bundle.mjs') }, source: 'config' }])
      context.blueprint.set('stone.builder.pluginModules', ['./prepared.mjs'])

      await RunStonePluginsBundleMiddleware(context, next)

      expect(context.blueprint.get('stone.builder.pluginModules')).toEqual(['./prepared.mjs', './bundle.mjs'])
    })

    it('is a no-op passthrough when no plugin was loaded', async () => {
      const context = makeContext([])
      await RunStonePluginsBundleMiddleware(context, next)
      expect(next).toHaveBeenCalledWith(context)
    })
  })
})
