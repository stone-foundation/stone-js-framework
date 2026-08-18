import { Locale, Resources, Translations } from './declarations'

/** The shape returned by `import.meta.glob(..., { eager: true })`: a `path -> module` map. */
export type GlobModules = Record<string, unknown>

/** The shape returned by `import.meta.glob(...)` (lazy): a `path -> () => import(...)` map. */
export type GlobLoaders = Record<string, () => Promise<unknown>>

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
 * import { defineConfig } from '@stone-js/core'
 * import { loadTranslations } from '@stone-js/i18n'
 *
 * export const AppConfig = defineConfig((blueprint) => blueprint.set('stone.i18n', {
 *   locales: ['en', 'fr'],
 *   resources: loadTranslations(import.meta.glob('/app/i18n/**\/*.{json,ts,js,yaml,yml}', { eager: true }))
 * }))
 * ```
 */
export function loadTranslations (modules: GlobModules): Resources {
  const resources: Resources = {}

  for (const [path, mod] of Object.entries(modules)) {
    const parsed = parseResourcePath(path)
    if (parsed === undefined) { continue }
    resources[parsed.locale] ??= {}
    resources[parsed.locale][parsed.namespace] = normalizeTranslations(mod)
  }

  return resources
}

/**
 * Parse the locale and namespace from a translation file path laid out as
 * `.../<locale>/<namespace>.<ext>`.
 *
 * @param path - The glob path.
 * @returns The locale and namespace, or `undefined` when the path is too shallow.
 */
export function parseResourcePath (path: string): { locale: Locale, namespace: string } | undefined {
  const segments = path.split('/').filter((segment) => segment.length > 0)
  const file = segments.pop()
  const locale = segments.pop()
  if (file === undefined || locale === undefined) { return undefined }
  return { locale, namespace: file.replace(/\.[^.]+$/, '') }
}

/**
 * Read a glob module's `default` export (or the module itself) as a translations bundle.
 *
 * @param mod - The imported module.
 * @returns The translations.
 */
export function normalizeTranslations (mod: unknown): Translations {
  return (isRecord(mod) && 'default' in mod ? mod.default : mod) as Translations
}

/** Whether a glob module is an object (so we can read its `default` export). */
function isRecord (value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
