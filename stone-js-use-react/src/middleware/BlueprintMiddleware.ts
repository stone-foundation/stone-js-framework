import {
  Promiseable,
  ClassType,
  IBlueprint,
  NextMiddleware,
  BlueprintContext
} from '@stone-js/core'
import { onPreparingResponse } from '../UseReactPageHooks'

/**
 * The one build-phase middleware that is web-specific: it registers the response hooks
 * that render into a document. The rest read decorator metadata and are shared, so they
 * live in `@stone-js/use-react-core`.
 */

/**
 * Blueprint middleware to dynamically set lifecycle hooks for react.
 *
 * @param context - The configuration context containing modules and blueprint.
 * @param next - The next pipeline function to continue processing.
 * @returns The updated blueprint or a promise resolving to it.
 *
 * @example
 * ```typescript
 * SetUseReactHooksMiddleware(context, next)
 * ```
 */
export const SetUseReactHooksMiddleware = (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promiseable<IBlueprint> => {
  const currentPlatform = context.blueprint.get<string>('stone.adapter.platform', '')
  const ignorePlatforms = context.blueprint.get<string[]>('stone.useReact.ignorePlatforms', [])

  if (!ignorePlatforms.includes(currentPlatform)) {
    context
      .blueprint
      .add('stone.lifecycleHooks.onPreparingResponse', [onPreparingResponse])
  }

  return next(context)
}
