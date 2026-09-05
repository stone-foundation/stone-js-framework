import { relative } from 'node:path'
import { IBlueprint } from '@stone-js/core'
import { buildPath } from '@stone-js/filesystem'
import { injectPluginBlueprints, injectPluginModules } from './inject'

/**
 * Weave the plugin contributions stashed on the blueprint into a generated entry point.
 *
 * Reads the modules and blueprint statements gathered by {@link RunStonePluginsMiddleware}
 * (`stone.builder.pluginModules` / `pluginBlueprints`) and applies both injectors. A no-op when
 * no plugin contributed anything or the template lacks the relevant markers, so entry generators
 * can call it unconditionally.
 *
 * @param content - The entry template source.
 * @param blueprint - The build blueprint carrying the contributions.
 * @param entryDir - Where the generated entry will be written. Contributed relative specifiers are
 *                   rewritten against it, because a plugin writes its files into `.stone` while an
 *                   entry lives in `.stone/tmp` for a production build and in `.stone` for a
 *                   development one: the same specifier has to reach the same file from both.
 * @returns The transformed source.
 */
export function applyPluginInjections (
  content: string,
  blueprint: IBlueprint,
  entryDir: string = buildPath('tmp')
): string {
  const modules = asStringArray(blueprint.get('stone.builder.pluginModules', []))
    .map((specifier) => resolveSpecifier(specifier, entryDir))
  const blueprints = asStringArray(blueprint.get('stone.builder.pluginBlueprints', []))

  return injectPluginBlueprints(injectPluginModules(content, modules), blueprints)
}

/**
 * Rewrite a contributed specifier so the generated entry can actually import it.
 *
 * A bare package name is left alone: it resolves through `node_modules` from anywhere. A relative
 * one is resolved against `.stone`, where `context.writeFile` puts every plugin file, and then
 * expressed relative to the entry that will import it.
 *
 * @param specifier - What the plugin contributed.
 * @param entryDir - Where the entry will be written.
 * @returns A specifier that resolves from the entry.
 */
function resolveSpecifier (specifier: string, entryDir: string): string {
  if (!specifier.startsWith('.')) { return specifier }

  const target = buildPath(specifier.replace(/^\.\/?/, ''))
  const relativePath = relative(entryDir, target).replaceAll('\\', '/')

  return relativePath.startsWith('.') ? relativePath : `./${relativePath}`
}

/**
 * Coerce a blueprint value to a string array, tolerating anything a blueprint might return.
 *
 * @param value - The raw blueprint value.
 * @returns The value when it is an array, otherwise an empty array.
 */
function asStringArray (value: unknown): string[] {
  return Array.isArray(value) ? value : []
}
