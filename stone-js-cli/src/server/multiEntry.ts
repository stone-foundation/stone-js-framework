import { globSync } from 'glob'
import { resolve } from 'node:path'
import type { Plugin } from 'rollup'

/**
 * Minimal, dependency-free replacement for `@rollup/plugin-multi-entry`.
 *
 * Rollup does not accept glob patterns as `input`. This plugin expands the configured glob(s) into
 * a single virtual entry that re-exports every matched module, so the whole `app/` tree is bundled
 * and Stone can collect the modules with `Object.values(import * as ...)`.
 *
 * Unlike `export *`, each file's exports are re-exported under a unique, per-file ALIAS. Two files
 * exporting the same name (e.g. every i18n bundle exporting `common`, or two handlers both exporting
 * `routes`) therefore never collide into one namespace, so nothing is silently dropped and Rollup
 * emits no "Conflicting namespaces" warning. The alias keys are unique, so `Object.values()` on the
 * bundle namespace still yields exactly one entry per original export.
 *
 * Glob negation is supported: a `!`-prefixed pattern (e.g. `!app/i18n/**`) is used as an ignore.
 *
 * @returns The Rollup plugin.
 */
export function multiEntry (): Plugin {
  const virtualId = '\0stone:multi-entry'
  let patterns: string[] = []

  return {
    name: 'stone-multi-entry',
    options (options) {
      patterns = ([] as string[]).concat(options.input as string | string[])
      return { ...options, input: virtualId }
    },
    resolveId (id) {
      return id === virtualId ? virtualId : null
    },
    async load (id) {
      if (id !== virtualId) { return null }

      const ignore = patterns.filter((pattern) => pattern.startsWith('!')).map((pattern) => pattern.slice(1))
      const include = patterns.filter((pattern) => !pattern.startsWith('!'))
      const files = [...new Set(include.flatMap((pattern) => globSync(pattern, { ignore })))].map((file) => resolve(file))

      const parts = await Promise.all(files.map(async (file, index) => {
        // `this.load` guarantees the module is evaluated (its decorators register) and lets us read
        // its export names so we can alias them.
        const info = await this.load({ id: file })
        const spec = JSON.stringify(file)
        // Mirror `export *`: re-export the named exports only (never `default`).
        const named = (info.exports ?? []).filter((name) => name !== 'default' && name !== '*')

        if (named.length === 0) {
          return `import ${spec}` // side-effect import: evaluated, but nothing to collect
        }

        return named
          .map((name) => `export { ${name} as $stone$${index}$${name} } from ${spec}`)
          .join('\n')
      }))

      return parts.join('\n')
    }
  }
}
