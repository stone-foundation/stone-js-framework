import fsExtra from 'fs-extra'
import { buildPath } from '@stone-js/filesystem'
import {
  createPluginContributions,
  createStonePluginContext
} from '../../src/plugins/StonePluginContext'

vi.mock('fs-extra', () => ({
  default: { outputFileSync: vi.fn() }
}))

vi.mock('@stone-js/filesystem', () => ({
  buildPath: vi.fn((...paths: string[]) => `/project/.stone/${paths.join('/')}`)
}))

describe('StonePluginContext', () => {
  const reporter: any = { step: vi.fn() }
  const context: any = {
    event: { id: 'evt' },
    blueprint: { id: 'bp' }
  }

  beforeEach(() => vi.clearAllMocks())

  it('starts with empty contributions', () => {
    expect(createPluginContributions()).toEqual({ modules: [], blueprints: [] })
  })

  it('exposes the command, event, blueprint and reporter', () => {
    const ctx = createStonePluginContext(context, 'build', reporter, createPluginContributions())

    expect(ctx.command).toBe('build')
    expect(ctx.event).toBe(context.event)
    expect(ctx.blueprint).toBe(context.blueprint)
    expect(ctx.reporter).toBe(reporter)
  })

  it('resolves paths inside the .stone/tmp directory', () => {
    const ctx = createStonePluginContext(context, 'build', reporter, createPluginContributions())
    expect(ctx.buildPath('a', 'b.mjs')).toBe('/project/.stone/tmp/a/b.mjs')
  })

  it('writes files into .stone/tmp and returns the absolute path', () => {
    const ctx = createStonePluginContext(context, 'build', reporter, createPluginContributions())
    const path = ctx.writeFile('plugins/x.mjs', 'export const a = 1')

    expect(buildPath).toHaveBeenCalledWith('tmp', 'plugins/x.mjs')
    expect(fsExtra.outputFileSync).toHaveBeenCalledWith('/project/.stone/tmp/plugins/x.mjs', 'export const a = 1', 'utf-8')
    expect(path).toBe('/project/.stone/tmp/plugins/x.mjs')
  })

  it('accumulates modules and de-duplicates them', () => {
    const contributions = createPluginContributions()
    const ctx = createStonePluginContext(context, 'build', reporter, contributions)

    ctx.addModule('./a.mjs')
    ctx.addModule('./a.mjs')
    ctx.addModule('./b.mjs')

    expect(contributions.modules).toEqual(['./a.mjs', './b.mjs'])
  })

  it('accumulates blueprint statements verbatim', () => {
    const contributions = createPluginContributions()
    const ctx = createStonePluginContext(context, 'build', reporter, contributions)

    ctx.addBlueprint("blueprint.set('a', 1)")
    ctx.addBlueprint("blueprint.set('a', 1)")

    expect(contributions.blueprints).toEqual(["blueprint.set('a', 1)", "blueprint.set('a', 1)"])
  })
})
