import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs'
import { join, extname, basename } from 'node:path'
import { I18nOptions, LocaleResources, Resources } from './declarations'
import { BlueprintContext, ClassType, IBlueprint, MetaMiddleware, NextMiddleware, Promiseable } from '@stone-js/core'

/**
 * The contract a Stone CLI plugin implements to participate in the build/bundle of an app.
 *
 * A plugin is plain data (no `@stone-js/cli` dependency): a name, an optional description, and
 * blueprint middleware that run during the CLI's config/build phase (they receive the app blueprint
 * and can read/augment it, e.g. inject generated config). The CLI loads plugins from `stone.config`
 * (explicit) or, opt-in, from a dependency's `package.json` `stone.cliPlugin` field (auto-discovery).
 */
export interface StoneCliPlugin {
  /** Unique plugin name (shown when the CLI loads it). */
  name: string
  /** One-line description. */
  description?: string
  /** Blueprint middleware run during the CLI build/config phase. */
  blueprintMiddleware?: Array<MetaMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>>
}

/** Options for the i18n CLI plugin. */
export interface I18nCliPluginOptions {
  /** The directory scanned for translations (relative to the project root). Default `'app/i18n'`. */
  dir?: string
}

/**
 * Scan a directory for translations laid out as `<dir>/<locale>/<namespace>.json` (build-time,
 * Node). Returns an empty map when the directory is absent, so it is always safe to call.
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

/**
 * Merge scanned resources with the config ones (config wins at the namespace level).
 *
 * @param scanned - Resources discovered on disk.
 * @param override - Resources declared in `stone.i18n.resources`.
 * @returns The merged resources.
 */
export function mergeResources (scanned: Resources, override: Resources): Resources {
  const result: Resources = {}
  for (const [locale, namespaces] of Object.entries(scanned)) {
    result[locale] = { ...namespaces }
  }
  for (const [locale, namespaces] of Object.entries(override)) {
    result[locale] ??= {}
    Object.assign(result[locale], namespaces)
  }
  return result
}

/**
 * Build the zero-config autoload blueprint middleware for a given directory. It scans the directory
 * and merges the result into `stone.i18n.resources` (config wins). Disabled by `stone.i18n.dir: false`.
 *
 * @param dir - The default directory (relative to the project root).
 * @returns A blueprint middleware.
 */
export function createAutoloadMiddleware (dir: string): (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
) => Promiseable<IBlueprint> {
  return async (context, next) => {
    const config = context.blueprint.get<I18nOptions>('stone.i18n', {})
    if (config.dir !== false) {
      const target = join(process.cwd(), typeof config.dir === 'string' ? config.dir : dir)
      context.blueprint.set('stone.i18n.resources', mergeResources(loadTranslationsFromDir(target), config.resources ?? {}))
    }
    return await next(context)
  }
}

/**
 * The i18n Stone CLI plugin: true zero-config. At build time it scans `app/i18n/<locale>/*.json` and
 * injects the resources into `stone.i18n.resources`, so no manual `loadTranslations(...)` line is
 * needed. Add it to your `stone.config` (`plugins: [i18nCliPlugin()]`) once the CLI supports plugins,
 * or rely on `package.json` auto-discovery.
 *
 * @param options - The plugin options.
 * @returns The Stone CLI plugin.
 */
export function i18nCliPlugin (options: I18nCliPluginOptions = {}): StoneCliPlugin {
  return {
    name: '@stone-js/i18n',
    description: 'Autoloads app/i18n/<locale>/<namespace>.json into stone.i18n.resources at build time.',
    blueprintMiddleware: [
      { module: createAutoloadMiddleware(options.dir ?? 'app/i18n'), priority: 5 }
    ]
  }
}

/** A ready-to-use plugin instance (used by `package.json` auto-discovery). */
const plugin: StoneCliPlugin = i18nCliPlugin()
export default plugin
