import { AdapterErrorPageOptions } from '../declarations'
import { REACT_ADAPTER_ERROR_PAGE_KEY } from '../decorators/constants'
import { UseReactServerErrorHandler } from '../server/UseReactServerErrorHandler'
import { UseReactBrowserErrorHandler } from '../browser/UseReactBrowserErrorHandler'
import { ClassType, BlueprintContext, IBlueprint, hasMetadata, getMetadata, isMatchedAdapter } from '@stone-js/core'

/**
 * Sets the error handler for the React adapter and registers error pages.
 *
 * @param errorHandler - The error handler to set for the React adapter.
 * @param context - The blueprint context containing modules and blueprint.
 * @returns The updated blueprint context with the error handler and error pages set.
 */
export function setUseReactAdapterErrorHandler (
  errorHandler:
  | typeof UseReactServerErrorHandler
  | typeof UseReactBrowserErrorHandler,
  context: BlueprintContext<IBlueprint, ClassType>
): BlueprintContext<IBlueprint, ClassType> {
  context
    .blueprint
    .set('stone.adapter.errorHandlers.default', { module: errorHandler, isClass: true })

  context
    .modules
    .filter(module => hasMetadata(module, REACT_ADAPTER_ERROR_PAGE_KEY))
    .forEach(module => {
      const { error, layout, adapterAlias, platform } = getMetadata<ClassType, AdapterErrorPageOptions>(
        module, REACT_ADAPTER_ERROR_PAGE_KEY, { error: 'default' }
      )
      if (isMatchedAdapter(context.blueprint, platform, adapterAlias)) {
        Array(error).flat().forEach(name => {
          context
            .blueprint
            .set(`stone.useReact.adapterErrorPages.${name}`, { isClass: true, layout, module })
        })
      }
    })

  // Process both eager and lazy loaded error pages
  Object
    .keys(context.blueprint.get('stone.useReact.adapterErrorPages', {}))
    .forEach((name) => {
      context
        .blueprint
        .set(`stone.adapter.errorHandlers.${name}`, { module: errorHandler, isClass: true })
    })

  return context
}
