import { VALIDATION_SCHEMA_KEY } from '../decorators/constants'
import { BlueprintContext, ClassType, IBlueprint, NextMiddleware, hasMetadata, getMetadata, type MetaMiddleware } from '@stone-js/core'

/** What `@ValidationSchema` records on a schema class. */
interface SchemaRegistration { alias?: string }

/**
 * Build-phase middleware: collect every class registered with `@ValidationSchema` into the registry.
 *
 * The same scan the router does for its route definitions, applied to this module's own key. After
 * it runs, `stone.validation.schemas` maps each alias to its class, so a route or a handler can name
 * a schema instead of importing it, and `@stone-js/openapi` can walk the registry to publish request
 * schemas without loading anything itself.
 *
 * @param context - The blueprint context.
 * @param next - The next blueprint middleware.
 * @returns The blueprint.
 */
export async function ValidationSchemaMiddleware (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promise<IBlueprint> {
  const registered = context
    .modules
    .filter((module) => hasMetadata(module, VALIDATION_SCHEMA_KEY))
    .reduce<Record<string, ClassType>>((registry, module) => {
    const { alias } = getMetadata<ClassType, SchemaRegistration>(module, VALIDATION_SCHEMA_KEY, {})
    return { ...registry, [alias ?? module.name]: module }
  }, {})

  if (Object.keys(registered).length > 0) {
    context.blueprint.set('stone.validation.schemas', {
      ...context.blueprint.get<Record<string, unknown>>('stone.validation.schemas', {}),
      ...registered
    })
  }

  return await next(context)
}

/**
 * Meta blueprint middleware for schema discovery.
 */
export const MetaValidationSchemaMiddleware: MetaMiddleware<any, any> = {
  module: ValidationSchemaMiddleware,
  priority: 5
}
