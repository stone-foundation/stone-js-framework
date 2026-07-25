import fsExtra from 'fs-extra'
import { join } from 'node:path'
import { StoneCliPlugin } from './declarations'
import { basePath, importModule, nodeModulesPath } from '@stone-js/filesystem'

const { readJsonSync } = fsExtra

/**
 * The npm scope of first-party packages the CLI trusts for zero-config auto-discovery.
 *
 * Only packages under this scope are ever loaded automatically from their `package.json`
 * contract; every third-party plugin must be declared explicitly in `stone.config`, so the
 * developer never runs unvetted build-time code from a transitive or untrusted dependency.
 */
export const STONE_SCOPE = '@stone-js/'

/**
 * The `package.json` field a first-party module uses to advertise its CLI plugin.
 *
 * e.g. `"stone": { "cliPlugin": "./dist/cli.js" }` — the value is a path, inside the package,
 * to a module whose default export (or the module itself) is a {@link StoneCliPlugin}.
 */
export const CLI_PLUGIN_CONTRACT = 'cliPlugin'

/**
 * A plugin paired with where it came from, for transparent, auditable logging.
 */
export interface LoadedStonePlugin {
  /**
   * The resolved plugin.
   */
  plugin: StoneCliPlugin

  /**
   * How it was loaded: `config` (declared in `stone.config`) or the package it was auto-discovered from.
   */
  source: string
}

/**
 * Type guard: is the value a usable {@link StoneCliPlugin}?
 *
 * @param value - The candidate.
 * @returns `true` when it is an object with a string `name`.
 */
export function isStoneCliPlugin (value: unknown): value is StoneCliPlugin {
  return typeof value === 'object' && value !== null && typeof (value as StoneCliPlugin).name === 'string'
}

/**
 * Import a first-party package's advertised CLI plugin.
 *
 * Reads the package's `package.json` `stone.cliPlugin` contract, imports the referenced module
 * (from the project's own `node_modules`, i.e. a direct dependency, never a transitive one) and
 * validates the result. Returns `undefined` when the package advertises no contract, the module
 * cannot be imported, or the export is not a plugin, so a broken dependency never breaks the build.
 *
 * @param name - The package name (e.g. `@stone-js/i18n`).
 * @returns The resolved plugin, or `undefined`.
 */
export async function resolveFirstPartyPlugin (name: string): Promise<StoneCliPlugin | undefined> {
  const meta = readJsonSync(nodeModulesPath(name, 'package.json'), { throws: false })
  const contract = meta?.stone?.[CLI_PLUGIN_CONTRACT]

  if (typeof contract !== 'string') { return undefined }

  const module = await importModule<Record<string, unknown>>(join('node_modules', name, contract))
  const plugin = module?.default ?? module

  return isStoneCliPlugin(plugin) ? plugin : undefined
}

/**
 * Auto-discover first-party (`@stone-js/*`) CLI plugins from the project's direct dependencies.
 *
 * Scans the project `package.json` `dependencies` and `devDependencies` (direct dependencies
 * only, never transitive) for `@stone-js/*` packages that advertise a `stone.cliPlugin` contract,
 * and resolves each. Third-party packages are deliberately ignored: they must go through
 * `stone.config`. Returns an empty list when there is no `package.json` or no match.
 *
 * @returns The discovered first-party plugins, paired with their source package.
 */
export async function discoverFirstPartyPlugins (): Promise<LoadedStonePlugin[]> {
  const pkg = readJsonSync(basePath('package.json'), { throws: false })
  const deps = { ...pkg?.dependencies, ...pkg?.devDependencies }
  const names = Object.keys(deps).filter((name) => name.startsWith(STONE_SCOPE))

  const resolved = await Promise.all(
    names.map(async (name) => {
      const plugin = await resolveFirstPartyPlugin(name)
      return plugin !== undefined ? { plugin, source: name } : undefined
    })
  )

  return resolved.filter((entry): entry is LoadedStonePlugin => entry !== undefined)
}

/**
 * Collect every CLI plugin for this run, from both loading paths, de-duplicated by name.
 *
 * Path A (explicit, open to any package): the `plugins: [...]` array from `stone.config`.
 * Path B (zero-config, first-party only): `@stone-js/*` direct dependencies advertising a
 * contract, unless `autoDiscover` is `false`. A plugin declared explicitly always wins over the
 * same plugin auto-discovered, so a developer can override a first-party plugin's options.
 *
 * @param configPlugins - Plugins declared in `stone.config` (`stone.builder.plugins`).
 * @param autoDiscover - Whether to auto-discover first-party plugins.
 * @returns The merged, de-duplicated plugins with their sources.
 */
export async function collectStonePlugins (
  configPlugins: StoneCliPlugin[],
  autoDiscover: boolean
): Promise<LoadedStonePlugin[]> {
  const explicit: LoadedStonePlugin[] = configPlugins
    .filter(isStoneCliPlugin)
    .map((plugin) => ({ plugin, source: 'config' }))

  const discovered = autoDiscover ? await discoverFirstPartyPlugins() : []
  const declaredNames = new Set(explicit.map((entry) => entry.plugin.name))

  return explicit.concat(discovered.filter((entry) => !declaredNames.has(entry.plugin.name)))
}
