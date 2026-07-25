import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs'
import { join, extname, basename } from 'node:path'
import { LocaleResources, Resources } from '../declarations'

/**
 * Scan a directory for zero-config translations laid out as `<dir>/<locale>/<namespace>.json`
 * (e.g. `app/i18n/en/common.json` → locale `en`, namespace `common`).
 *
 * Node-only (it reads the filesystem); the browser build ships an inert stub instead. It returns an
 * empty map when the directory is absent, so it is always safe to call.
 *
 * @param dir - The absolute directory to scan.
 * @returns The resource map.
 */
export function loadTranslationsFromDir (dir: string): Resources {
  if (!existsSync(dir)) { return {} }

  const resources: Resources = {}

  for (const locale of readdirSync(dir)) {
    const localeDir = join(dir, locale)
    if (!statSync(localeDir).isDirectory()) { continue }

    const namespaces: LocaleResources = {}
    for (const entry of readdirSync(localeDir)) {
      const file = join(localeDir, entry)
      if (extname(entry).toLowerCase() !== '.json' || !statSync(file).isFile()) { continue }
      namespaces[basename(entry, extname(entry))] = JSON.parse(readFileSync(file, 'utf-8'))
    }

    if (Object.keys(namespaces).length > 0) { resources[locale] = namespaces }
  }

  return resources
}
