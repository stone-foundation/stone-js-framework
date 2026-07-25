import { CONCAT_MARKER, BLUEPRINT_MARKER } from '../../src/plugins/inject'
import { applyPluginInjections } from '../../src/plugins/applyPluginInjections'

describe('applyPluginInjections', () => {
  const template = `const modules = base
  ${CONCAT_MARKER}
configure((blueprint) => {
    ${BLUEPRINT_MARKER}
  })`

  const blueprintWith = (modules: string[], blueprints: string[]): any => ({
    get: (key: string, fallback: unknown) => {
      if (key === 'stone.builder.pluginModules') { return modules }
      if (key === 'stone.builder.pluginBlueprints') { return blueprints }
      return fallback
    }
  })

  it('is a no-op when nothing was contributed', () => {
    expect(applyPluginInjections(template, blueprintWith([], []))).toBe(template)
  })

  it('is a no-op when the blueprint returns no contributions at all', () => {
    const blueprint: any = { get: () => undefined }
    expect(applyPluginInjections(template, blueprint)).toBe(template)
  })

  it('injects both contributed modules and blueprint statements', () => {
    const result = applyPluginInjections(template, blueprintWith(['./a.mjs'], ["blueprint.set('a', 1)"]))

    expect(result).toContain('import * as __stonePlugin0 from "./a.mjs"')
    expect(result).toContain('.concat(Object.values(__stonePlugin0))')
    expect(result).toContain("blueprint.set('a', 1)")
  })
})
