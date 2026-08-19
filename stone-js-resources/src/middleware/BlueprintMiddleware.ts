import { API_RESOURCE_KEY } from '../decorators/constants'
import { BlueprintContext, ClassType, IBlueprint, NextMiddleware, hasMetadata, getMetadata, type MetaMiddleware } from '@stone-js/core'

/** What `@ApiResource` records on a resource class. */
interface ResourceRegistration { alias?: string }

/**
 * Build-phase middleware: collect every class registered with `@ApiResource` into the registry.
 *
 * The same scan the router does for its route definitions, applied to this module's own key. After it
 * runs, `stone.resources.registry` maps each alias to its class, so a route or a handler can name a
 * resource instead of importing it, and `@stone-js/openapi` can walk the registry to publish response
 * shapes without loading anything itself.
 *
 * @param context - The blueprint context.
 * @param next - The next blueprint middleware.
 * @returns The blueprint.
 */
export async function ApiResourceMiddleware (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promise<IBlueprint> {
  const registered = context
    .modules
    .filter((module) => hasMetadata(module, API_RESOURCE_KEY))
    .reduce<Record<string, ClassType>>((registry, module) => {
    const { alias } = getMetadata<ClassType, ResourceRegistration>(module, API_RESOURCE_KEY, {})
    return { ...registry, [alias ?? module.name]: module }
  }, {})

  if (Object.keys(registered).length > 0) {
    context.blueprint.set('stone.resources.registry', {
      ...context.blueprint.get<Record<string, unknown>>('stone.resources.registry', {}),
      ...registered
    })
  }

  return await next(context)
}

/**
 * Meta blueprint middleware for resource discovery.
 */
export const MetaApiResourceMiddleware: MetaMiddleware<any, any> = {
  module: ApiResourceMiddleware,
  priority: 5
}
