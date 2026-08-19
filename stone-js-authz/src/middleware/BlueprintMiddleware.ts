import { POLICY_KEY } from '../decorators/constants'
import { BlueprintContext, ClassType, IBlueprint, NextMiddleware, hasMetadata, getMetadata, type MetaMiddleware } from '@stone-js/core'

/** What `@Policy` records on a policy class. */
interface PolicyRegistration { alias?: string }

/**
 * Build-phase middleware: collect every class registered with `@Policy` into the registry.
 *
 * The same scan the router does for its route definitions, applied to this module's own key. After it
 * runs, `stone.authz.policies` maps each alias to its class, so a route or a handler can name a policy
 * instead of importing it.
 *
 * @param context - The blueprint context.
 * @param next - The next blueprint middleware.
 * @returns The blueprint.
 */
export async function PolicyMiddleware (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promise<IBlueprint> {
  const registered = context
    .modules
    .filter((module) => hasMetadata(module, POLICY_KEY))
    .reduce<Record<string, ClassType>>((registry, module) => {
    const { alias } = getMetadata<ClassType, PolicyRegistration>(module, POLICY_KEY, {})
    return { ...registry, [alias ?? module.name]: module }
  }, {})

  if (Object.keys(registered).length > 0) {
    context.blueprint.set('stone.authz.policies', {
      ...context.blueprint.get<Record<string, unknown>>('stone.authz.policies', {}),
      ...registered
    })
  }

  return await next(context)
}

/**
 * Meta blueprint middleware for policy discovery.
 */
export const MetaPolicyMiddleware: MetaMiddleware<any, any> = {
  module: PolicyMiddleware,
  priority: 5
}
