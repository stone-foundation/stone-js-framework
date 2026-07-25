import { join } from 'node:path'
import { loadTranslationsFromDir } from './loadTranslationsFromDir'
import { I18nOptions, Resources } from '../declarations'
import { BlueprintContext, ClassType, IBlueprint, MetaMiddleware, NextMiddleware, Promiseable } from '@stone-js/core'

/**
 * Merge scanned resources with config resources; config wins at the namespace level.
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
    result[locale] = { ...(result[locale] ?? {}), ...namespaces }
  }
  return result
}

/**
 * Zero-config autoloader (setup phase). Scans `app/i18n` (or `stone.i18n.dir`) and merges the
 * discovered `<locale>/<namespace>.json` bundles into `stone.i18n.resources` (config wins). Disable
 * it with `stone.i18n.dir: false`.
 *
 * @param context - The blueprint context.
 * @param next - The next blueprint middleware.
 * @returns The updated blueprint.
 */
export const LoadTranslationsMiddleware = (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promiseable<IBlueprint> => {
  const config = context.blueprint.get<I18nOptions>('stone.i18n', {})

  if (config.dir !== false) {
    const dir = join(process.cwd(), typeof config.dir === 'string' ? config.dir : 'app/i18n')
    context.blueprint.set('stone.i18n.resources', mergeResources(loadTranslationsFromDir(dir), config.resources ?? {}))
  }

  return next(context)
}

/**
 * The backend blueprint middleware set for i18n.
 */
export const metaServerI18nBlueprintMiddleware: Array<MetaMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>> = [
  { module: LoadTranslationsMiddleware, priority: 5 }
]
