import { IBlueprint } from '@stone-js/core'
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
 * @returns The transformed source.
 */
export function applyPluginInjections (content: string, blueprint: IBlueprint): string {
  const modules = asStringArray(blueprint.get('stone.builder.pluginModules', []))
  const blueprints = asStringArray(blueprint.get('stone.builder.pluginBlueprints', []))

  return injectPluginBlueprints(injectPluginModules(content, modules), blueprints)
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
