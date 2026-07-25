import { globSync } from 'glob'
import { resolve } from 'node:path'
import type { Plugin } from 'rollup'

/**
 * Minimal, dependency-free replacement for `@rollup/plugin-multi-entry`.
 *
 * Rollup does not accept glob patterns as `input`. This plugin expands the configured glob(s)
 * into a single virtual entry that re-exports every matched module, reproducing multi-entry's
 * default behaviour, without its deprecated `matched` -> `glob@7` -> `inflight` dependency chain.
 *
 * @returns The Rollup plugin.
 */
export function multiEntry (): Plugin {
  const virtualId = '\0stone:multi-entry'
  let entries: string[] = []

  return {
    name: 'stone-multi-entry',
    options (options) {
      const patterns = ([] as string[]).concat(options.input as string | string[])
      entries = patterns
        .flatMap((pattern) => globSync(pattern))
        .map((file) => resolve(file))
      return { ...options, input: virtualId }
    },
    resolveId (id) {
      return id === virtualId ? virtualId : null
    },
    load (id) {
      if (id !== virtualId) { return null }
      return entries.map((file) => `export * from ${JSON.stringify(file)}`).join('\n')
    }
  }
}
