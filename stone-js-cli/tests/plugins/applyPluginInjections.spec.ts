import { buildPath } from '@stone-js/filesystem'
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
    // `../a.mjs`, not `./a.mjs`: a plugin writes into `.stone` while a production entry lives in
    // `.stone/tmp`, so the specifier is rewritten to reach the same file from where it is imported.
    const result = applyPluginInjections(template, blueprintWith(['./a.mjs'], ["blueprint.set('a', 1)"]))

    expect(result).toContain('import * as __stonePlugin0 from "../a.mjs"')
    expect(result).toContain('.concat(Object.values(__stonePlugin0))')
    expect(result).toContain("blueprint.set('a', 1)")
  })
})

describe('the same contributed file, from either entry', () => {
  const template = `const modules = base
  ${CONCAT_MARKER}`

  const blueprintWith = (modules: string[]): any => ({
    get: (key: string, fallback: unknown) => (key === 'stone.builder.pluginModules' ? modules : fallback)
  })

  it('reaches it from a production entry and from a development one', () => {
    // The two entries do not live in the same place: a build writes `.stone/tmp/index.ts`, a dev
    // server writes `.stone/index.ts`. A plugin writes one file, under `.stone/plugins`, and says so
    // once. Both entries must arrive at that file, which is the whole reason a contributed specifier
    // is rewritten rather than copied.
    const contributed = ['./plugins/i18n.mjs']

    const production = applyPluginInjections(template, blueprintWith(contributed), buildPath('tmp'))
    const development = applyPluginInjections(template, blueprintWith(contributed), buildPath())

    expect(production).toContain('"../plugins/i18n.mjs"')
    expect(development).toContain('"./plugins/i18n.mjs"')
  })

  it('leaves a bare package name alone, since it resolves from anywhere', () => {
    expect(applyPluginInjections(template, blueprintWith(['@scope/pkg']))).toContain('"@scope/pkg"')
  })
})
