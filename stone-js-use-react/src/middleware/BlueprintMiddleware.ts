import {
  ClassType,
  IBlueprint,
  isNotEmpty,
  Promiseable,
  hasMetadata,
  getMetadata,
  NextMiddleware,
  BlueprintContext
} from '@stone-js/core'
import {
  REACT_PAGE_KEY,
  STONE_REACT_APP_KEY,
  REACT_ERROR_PAGE_KEY,
  REACT_PAGE_LAYOUT_KEY,
  REACT_VIEW_PROVIDER_KEY
} from '../decorators/constants'
import { PageRouteDefinition } from '@stone-js/router'
import { defineViewProvider, ViewProviderOptions } from '@stone-js/use-view'
import { onPreparingResponse } from '../UseReactPageHooks'
import { UseReactEventHandler } from '../UseReactEventHandler'
import { ErrorPageOptions, PageLayoutOptions } from '../declarations'
import { UseReactKernelErrorHandler } from '../UseReactKernelErrorHandler'

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

/**
 * Blueprint middleware to process and register kernel error page definitions from modules.
 *
 * @param context - The configuration context containing modules and blueprint.
 * @param next - The next pipeline function to continue processing.
 * @returns The updated blueprint or a promise resolving to it.
 *
 * @example
 * ```typescript
 * SetReactKernelErrorPageMiddleware(context, next)
 * ```
 */
export const SetReactKernelErrorPageMiddleware = (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promiseable<IBlueprint> => {
  context
    .blueprint
    .set('stone.kernel.errorHandlers.default', { module: UseReactKernelErrorHandler, isClass: true })

  context
    .modules
    .filter(module => hasMetadata(module, REACT_ERROR_PAGE_KEY))
    .forEach(module => {
      const { error, layout } = getMetadata<ClassType, ErrorPageOptions>(module, REACT_ERROR_PAGE_KEY, { error: 'default' })
      new Array(error).flat().forEach(name => {
        context
          .blueprint
          .set(`stone.useReact.errorPages.${name}`, { layout, module, isClass: true })
      })
    })

  // Process both eager and lazy loaded error pages
  Object
    .keys(context.blueprint.get('stone.useReact.errorPages', {}))
    .forEach((name) => {
      context
        .blueprint
        .set(`stone.kernel.errorHandlers.${name}`, { module: UseReactKernelErrorHandler, isClass: true })
    })

  return next(context)
}

/**
 * Blueprint middleware to process and register route definitions from modules.
 *
 * @param context - The configuration context containing modules and blueprint.
 * @param next - The next pipeline function to continue processing.
 * @returns The updated blueprint or a promise resolving to it.
 *
 * @example
 * ```typescript
 * SetReactRouteDefinitionsMiddleware(context, next)
 * ```
 */
export const SetReactRouteDefinitionsMiddleware = (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promiseable<IBlueprint> => {
  context
    .modules
    .filter(module => hasMetadata(module, REACT_PAGE_KEY))
    .forEach(module => {
      const options = getMetadata<ClassType, PageRouteDefinition>(module, REACT_PAGE_KEY, { path: '/' } as any)
      const definition = {
        ...options,
        handler: { ...options.handler, module }
      }
      context.blueprint.add('stone.router.definitions', [definition])
    })

  return next(context)
}

/**
 * Blueprint middleware to process and register layout definitions from modules.
 *
 * @param context - The configuration context containing modules and blueprint.
 * @param next - The next pipeline function to continue processing.
 * @returns The updated blueprint or a promise resolving to it.
 *
 * @example
 * ```typescript
 * SetReactPageLayoutMiddleware(context, next)
 * ```
 */
export const SetReactPageLayoutMiddleware = (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promiseable<IBlueprint> => {
  context
    .modules
    .filter(module => hasMetadata(module, REACT_PAGE_LAYOUT_KEY))
    .forEach(module => {
      const { name = 'default' } = getMetadata<ClassType, PageLayoutOptions>(module, REACT_PAGE_LAYOUT_KEY, { name: 'default' })
      context.blueprint.set(`stone.useReact.layouts.${name}`, { isClass: true, module })
    })

  return next(context)
}

/**
 * Blueprint middleware to process and register view providers declared with `@ViewProvider`.
 *
 * View providers wrap the application root (design-system theme, i18n, store, …). This
 * middleware discovers every `@ViewProvider`-decorated class among the build's modules and
 * appends it to `stone.useReact.providers` — the same key the imperative `defineViewProvider`
 * feeds — so declarative and imperative registration converge on one list that
 * `buildAppComponent` composes around the app (outermost-first by ascending `priority`).
 *
 * @param context - The configuration context containing modules and blueprint.
 * @param next - The next pipeline function to continue processing.
 * @returns The updated blueprint or a promise resolving to it.
 *
 * @example
 * ```typescript
 * SetReactViewProvidersMiddleware(context, next)
 * ```
 */
export const SetReactViewProvidersMiddleware = (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promiseable<IBlueprint> => {
  context
    .modules
    .filter(module => hasMetadata(module, REACT_VIEW_PROVIDER_KEY))
    .forEach(module => {
      const options = getMetadata<ClassType, ViewProviderOptions>(module, REACT_VIEW_PROVIDER_KEY, {})
      context.blueprint.add('stone.useReact.providers', [defineViewProvider(module, { ...options, isClass: true })])
    })

  return next(context)
}

/**
 * Blueprint middleware to set the UseReact as the main event handler for the application.
 *
 * Set as fallback event handler if none of the other event handlers are registered.
 *
 * @param context - The configuration context containing modules and blueprint.
 * @param next - The next function in the pipeline.
 * @returns The updated blueprint.
 *
 * @example
 * ```typescript
 * SetUseReactEventHandlerMiddleware({ modules, blueprint }, next);
 * ```
 */
export async function SetUseReactEventHandlerMiddleware (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promise<IBlueprint> {
  const blueprint = await next(context)
  const module = context.modules.find(module => hasMetadata(module, STONE_REACT_APP_KEY))

  blueprint.setIf('stone.kernel.eventHandler', { module: UseReactEventHandler, isClass: true })

  if (isNotEmpty<ClassType>(module)) {
    blueprint.set('stone.useReact.componentEventHandler', { module, isComponent: true, isClass: true })
  }

  return blueprint
}
