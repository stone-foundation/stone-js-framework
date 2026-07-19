import { applyFields } from './helpers'
import { IResource, ResourceContext, ResourceEnvelope, ResourceOutput } from './declarations'

/**
 * Base API resource — the declarative way to shape what your domain exposes.
 *
 * Extend it and implement {@link Resource.toArray} to map a model to its public shape. Everything
 * else (sparse fieldsets, dropping conditional fields, collections, envelopes) is handled for you.
 * A resource is decoupled from controllers and platform-agnostic: the same resource shapes data on
 * the backend and on the frontend.
 *
 * @example
 * ```ts
 * class UserResource extends Resource<User> {
 *   toArray (user: User, ctx: ResourceContext) {
 *     return {
 *       id: user.id,
 *       name: user.name,
 *       email: this.when(ctx.self === true, user.email),
 *       posts: this.whenIncluded(ctx, 'posts', () => postResource.collection(user.posts))
 *     }
 *   }
 * }
 * ```
 */
export abstract class Resource<Model = unknown, Output extends ResourceOutput = ResourceOutput> implements IResource<Model, Output> {
  /**
   * Map a model to its public shape (before field filtering).
   *
   * @param model - The domain model.
   * @param context - The resource context.
   * @returns The public shape.
   */
  abstract toArray (model: Model, context: ResourceContext): Output

  /**
   * Transform one model, applying the requested sparse fieldset and dropping undefined fields.
   *
   * @param model - The domain model.
   * @param context - The resource context.
   * @returns The filtered public shape.
   */
  item (model: Model, context: ResourceContext = {}): Partial<Output> {
    return applyFields(this.toArray(model, context), context.fields)
  }

  /**
   * Transform a collection of models.
   *
   * @param models - The domain models.
   * @param context - The resource context.
   * @returns The transformed collection.
   */
  collection (models: Model[], context: ResourceContext = {}): Array<Partial<Output>> {
    return models.map((model) => this.item(model, context))
  }

  /**
   * Wrap a model or a collection in a `{ data, meta }` envelope.
   *
   * @param models - A model or a collection.
   * @param context - The resource context.
   * @param meta - Optional metadata (pagination, counts, …).
   * @returns The envelope.
   */
  response (models: Model | Model[], context: ResourceContext = {}, meta?: Record<string, unknown>): ResourceEnvelope<Partial<Output> | Array<Partial<Output>>> {
    const data = Array.isArray(models) ? this.collection(models, context) : this.item(models, context)
    return meta === undefined ? { data } : { data, meta }
  }

  /**
   * Include a value only when `condition` is truthy (otherwise the field is dropped).
   *
   * @param condition - Whether to include the value.
   * @param value - The value, or a lazy factory (only evaluated when included).
   * @returns The value, or `undefined`.
   */
  protected when<T> (condition: boolean, value: T | (() => T)): T | undefined {
    if (!condition) { return undefined }
    return typeof value === 'function' ? (value as () => T)() : value
  }

  /**
   * Include a value only when the relation was requested via `context.include`.
   *
   * @param context - The resource context.
   * @param name - The relation name.
   * @param value - The value, or a lazy factory (only evaluated when included).
   * @returns The value, or `undefined`.
   */
  protected whenIncluded<T> (context: ResourceContext, name: string, value: T | (() => T)): T | undefined {
    return this.when(context.include?.includes(name) === true, value)
  }
}
