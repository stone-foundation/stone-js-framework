import {
  CONCAT_MARKER,
  BLUEPRINT_MARKER,
  injectPluginModules,
  injectPluginBlueprints
} from '../../src/plugins/inject'

describe('inject', () => {
  describe('injectPluginModules', () => {
    const template = `const modules = base
  ${CONCAT_MARKER}
`

    it('returns the content untouched when there are no modules', () => {
      expect(injectPluginModules(template, [])).toBe(template)
    })

    it('returns the content untouched when there is no concat marker', () => {
      const content = 'const modules = base'
      expect(injectPluginModules(content, ['./a.mjs'])).toBe(content)
    })

    it('prepends a namespace import and chains a concat per module', () => {
      const result = injectPluginModules(template, ['./a.mjs', '@scope/b'])

      expect(result).toContain('import * as __stonePlugin0 from "./a.mjs"')
      expect(result).toContain('import * as __stonePlugin1 from "@scope/b"')
      expect(result).toContain('.concat(Object.values(__stonePlugin0)).concat(Object.values(__stonePlugin1))')
    })

    it('preserves the concat marker so later passes can still target it', () => {
      const result = injectPluginModules(template, ['./a.mjs'])
      expect(result).toContain(CONCAT_MARKER)
    })
  })

  describe('injectPluginBlueprints', () => {
    const template = `configure((blueprint) => {
    ${BLUEPRINT_MARKER}
  })`

    it('returns the content untouched when there are no statements', () => {
      expect(injectPluginBlueprints(template, [])).toBe(template)
    })

    it('returns the content untouched when there is no blueprint marker', () => {
      const content = 'configure(() => {})'
      expect(injectPluginBlueprints(content, ["blueprint.set('a', 1)"])).toBe(content)
    })

    it('splices statements at the blueprint marker and preserves it', () => {
      const result = injectPluginBlueprints(template, ["blueprint.set('a', 1)", "blueprint.set('b', 2)"])

      expect(result).toContain("blueprint.set('a', 1)")
      expect(result).toContain("blueprint.set('b', 2)")
      expect(result).toContain(BLUEPRINT_MARKER)
    })
  })
})
