import { Resources, Translations } from './declarations'

/** The shape returned by `import.meta.glob(..., { eager: true })`: a `path -> module` map. */
export type GlobModules = Record<string, unknown>

/**
 * Normalise a bundler glob into a Stone.js resource map — the isomorphic, tree-shakeable way to
 * autoload translations laid out as `app/i18n/<locale>/<namespace>.<ext>`.
 *
 * It works identically on the backend (Rollup) and the frontend (Vite), leaves the bundler to emit
 * only real imports (so it tree-shakes), and supports every format the bundler can import (JSON, TS,
 * JS, YAML, ...). Each file's `default` export (or the module itself) becomes the namespace bundle;
 * the locale and namespace are taken from the path.
 *
 * @param modules - An eager `import.meta.glob` result.
 * @returns The resource map.
 *
 * @example
 * ```typescript
 * import { defineI18n, loadTranslations } from '@stone-js/i18n'
 *
 * export const AppConfig = defineConfig(defineI18n({
 *   locales: ['en', 'fr'],
 *   resources: loadTranslations(import.meta.glob('/app/i18n/**\/*.{json,ts,js,yaml,yml}', { eager: true }))
 * }))
 * ```
 */
export function loadTranslations (modules: GlobModules): Resources {
  const resources: Resources = {}

  for (const [path, mod] of Object.entries(modules)) {
    const segments = path.split('/').filter((segment) => segment.length > 0)
    const file = segments.pop()
    const locale = segments.pop()
    if (file === undefined || locale === undefined) { continue }

    const namespace = file.replace(/\.[^.]+$/, '')
    const translations = (isRecord(mod) && 'default' in mod ? mod.default : mod) as Translations
    resources[locale] = { ...(resources[locale] ?? {}), [namespace]: translations }
  }

  return resources
}

/** Whether a glob module is an object (so we can read its `default` export). */
function isRecord (value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
