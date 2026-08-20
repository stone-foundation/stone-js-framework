import { Resource, SchemaValidator } from './Resource'
import { ContractViolationPolicy, ResourceContext, ResourceOutput, ResourceSchema } from './declarations'

/**
 * What an imperatively-defined resource declares.
 *
 * The same three things a class declares, so neither paradigm can do something the other cannot.
 */
export interface ResourceDefinition<Model = unknown> {
  /** The contract: what this resource exposes. A schema, or a function returning one. */
  schema: ResourceSchema | ((context: ResourceContext) => ResourceSchema | Promise<ResourceSchema>)
  /** Named subsets a caller may ask for, each with its own schema. */
  fragments?: Record<string, ResourceSchema> | ((context: ResourceContext) => Record<string, ResourceSchema> | Promise<Record<string, ResourceSchema>>)
  /** Optional hook to shape or complete the model before it meets the schema. */
  data?: (model: Model, context: ResourceContext) => unknown | Promise<unknown>
}

/**
 * The imperative way to define a resource: an object instead of a class.
 *
 * Parity is the rule, so this declares exactly what a class declares and gets exactly what a class
 * gets. What it cannot have is a constructor the container fills, which is why a projection takes its
 * validator from the context: the middleware puts it there, and a resource used directly in a service
 * is handed one the same way.
 *
 * @param definition - The schema, and optionally fragments and a `data()` hook.
 * @param dependencies - Optional explicit services, for a resource used outside a request.
 * @returns A resource.
 *
 * @example
 * ```ts
 * export const userResource = defineResource<User>({
 *   schema: z.object({ id: z.number(), name: z.string() }),
 *   fragments: { summary: z.object({ id: z.number() }) },
 *   data: async (user) => ({ ...user, posts: await posts.titlesOf(user.id) })
 * })
 * ```
 */
export function defineResource<Model = unknown, Output extends ResourceOutput = ResourceOutput> (
  definition: ResourceDefinition<Model>,
  dependencies: { validator?: SchemaValidator, onViolation?: ContractViolationPolicy } = {}
): Resource<Model, Output> {
  const resource = new class extends Resource<Model, Output> {
    async schema (context: ResourceContext): Promise<ResourceSchema> {
      if (typeof definition.schema !== 'function') { return definition.schema }
      const build = definition.schema as (c: ResourceContext) => Promise<ResourceSchema>
      return await build(context)
    }
  }(dependencies)

  if (definition.fragments !== undefined) {
    const declared = definition.fragments
    resource.fragments = async (context: ResourceContext) => {
      if (typeof declared !== 'function') { return declared }
      return await declared(context)
    }
  }

  if (definition.data !== undefined) {
    resource.data = definition.data
  }

  return resource
}
