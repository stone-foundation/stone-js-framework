import { Resource } from './Resource'
import { ResourceContext, ResourceOutput } from './declarations'

/**
 * The imperative/functional way to define a resource — a plain transform function instead of a
 * class. Returns a full {@link Resource} (so you still get `item`/`collection`/`response` and
 * sparse fieldsets for free).
 *
 * @param transform - Maps a model to its public shape.
 * @returns A resource.
 *
 * @example
 * ```ts
 * const userResource = defineResource<User>((user) => ({ id: user.id, name: user.name }))
 * userResource.collection(users, { fields: ['id'] })
 * ```
 */
export function defineResource<Model = unknown, Output extends ResourceOutput = ResourceOutput> (
  transform: (model: Model, context: ResourceContext) => Output
): Resource<Model, Output> {
  return new class extends Resource<Model, Output> {
    toArray (model: Model, context: ResourceContext): Output {
      return transform(model, context)
    }
  }()
}
