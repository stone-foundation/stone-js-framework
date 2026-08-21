import { Promiseable } from '@stone-js/core'
import { applyFields } from './helpers'
import { ContractChecker, IContractChecker } from './ContractChecker'
import { ResourceContractError } from './errors/ResourceContractError'
import {
  ContractViolationPolicy, IResource, ResourceContext, ResourceEnvelope, ResourceOutput, ResourceSchema
} from './declarations'

/**
 * Base API resource — the layer responsible for exposing data.
 *
 * A resource answers two questions, and the second is what makes it worth having. *What leaves?* —
 * and *what did you promise leaves?* The promise is a schema, so the same declaration validates the
 * response, documents it in the published contract, and lets a caller ask for a named subset of it.
 *
 * Projection is the schema's own work: what the schema does not describe is not exposed, so a field
 * added to a model later — a password hash, an internal flag — cannot leak by being forgotten.
 *
 * @example
 * ```ts
 * @ApiResource('user')
 * export class UserResource extends Resource<User> {
 *   constructor ({ posts }: { posts: PostService }) {
 *     super()
 *     this.posts = posts
 *   }
 *
 *   schema () {
 *     return z.object({ id: z.number(), name: z.string(), posts: z.array(z.string()).optional() })
 *   }
 *
 *   fragments () {
 *     return { summary: z.object({ id: z.number(), name: z.string() }) }
 *   }
 *
 *   async data (user: User) {
 *     return { ...user, posts: await this.posts.titlesOf(user.id) }
 *   }
 * }
 * ```
 */
/**
 * What a resource may be handed when the container builds it.
 *
 * Only names this module binds itself, because destructuring reads every one of them: a name nothing
 * bound would throw before the resource ever exists. Configuration is not in here on purpose, it
 * comes from the blueprint, which is where configuration lives.
 */
export interface ResourceDependencies {
  /** The reader every projection is held against, bound as `contractChecker`. */
  contractChecker?: IContractChecker
}

export abstract class Resource<
  Model = unknown,
  Output extends ResourceOutput = ResourceOutput,
  EventType = unknown,
  PrincipalType = unknown
> implements IResource<Model, Output, EventType, PrincipalType> {
  protected checker: IContractChecker
  protected onViolation: ContractViolationPolicy

  /**
   * @param dependencies - Auto-wired services.
   *
   * One name, bound by this module's own blueprint, so the container resolves it like any other service
   * and this constructor reads it plainly. That is the whole point: a dependency read off a container
   * that never bound it is not optional, it throws, which is what made every container-resolved
   * resource fail. The answer was to register the checker, not to test for its presence.
   *
   * One name and no more, because destructuring reads each one: a resource must not have to know
   * which services happen to be bound. The violation policy is configuration, and it travels with the
   * request in the context, from `stone.resources.onViolation`. Substituting the dialect is a matter
   * of binding `contractChecker` yourself.
   */
  constructor ({ contractChecker }: ResourceDependencies = {}) {
    this.checker = contractChecker ?? ContractChecker.create()
    this.onViolation = 'throw'
  }

  /**
   * The contract: what this resource exposes.
   *
   * @param context - The resource context.
   * @returns The schema.
   */
  abstract schema (context: ResourceContext<EventType, PrincipalType>): ResourceSchema | Promise<ResourceSchema>

  /**
   * Project one model.
   *
   * The order is the design: complete the data, choose the contract the caller asked for, hold the
   * result against it, then narrow. Validation happens *before* narrowing, so the promise is checked
   * against everything the resource produced rather than against whatever survived a query parameter.
   *
   * @param model - The domain model.
   * @param context - The resource context.
   * @returns The projected output.
   * @throws {ResourceContractError} When the data breaks the contract and the policy is `throw`.
   */
  async item (model: Model, context: ResourceContext<EventType, PrincipalType> = {}): Promise<Output> {
    const data = this.data !== undefined ? await this.data(model, context) : model
    const schema = await this.schemaFor(context)
    const projected = await this.project(data, schema, context)

    return applyFields(projected as ResourceOutput, context.fields) as Output
  }

  /**
   * Project a collection.
   *
   * Sequential rather than concurrent: `data()` may reach a database or an API, and a hundred models
   * turning into a hundred simultaneous calls is a denial of service an application performs on
   * itself. A resource that wants concurrency batches inside its own `data()`, where it knows the cost.
   *
   * @param models - The domain models.
   * @param context - The resource context.
   * @returns The projected collection.
   */
  async collection (models: Model[], context: ResourceContext<EventType, PrincipalType> = {}): Promise<Output[]> {
    const out: Output[] = []

    for (const model of models) {
      out.push(await this.item(model, context))
    }

    return out
  }

  /**
   * Project into a `{ data, meta }` envelope.
   *
   * @param models - A model or a collection.
   * @param context - The resource context.
   * @param meta - Optional metadata (pagination, counts, …).
   * @returns The envelope.
   */
  async response (
    models: Model | Model[],
    context: ResourceContext<EventType, PrincipalType> = {},
    meta?: Record<string, unknown>
  ): Promise<ResourceEnvelope<Output | Output[]>> {
    const data = Array.isArray(models)
      ? await this.collection(models, context)
      : await this.item(models, context)

    return meta === undefined ? { data } : { data, meta }
  }

  /**
   * The schema to hold this projection against: the requested fragment when the resource exposes one,
   * the full contract otherwise.
   *
   * An unknown fragment falls back to the full contract rather than failing. A caller guessing
   * `?view=nonsense` is asking a question, not attacking: answering the documented shape is more
   * useful than a 500, and the fragments a resource exposes are published in the contract anyway.
   *
   * @param context - The resource context.
   * @returns The schema.
   */
  protected async schemaFor (context: ResourceContext<EventType, PrincipalType>): Promise<ResourceSchema> {
    const name = context.fragment

    if (name !== undefined && this.fragments !== undefined) {
      const available = await this.fragments(context)
      if (available[name] !== undefined) { return available[name] }
    }

    return this.schema(context)
  }

  /**
   * Hold the data against the contract, and return what the contract describes.
   *
   * The schema is the projection: its parsed value is the output, so a field the contract does not
   * mention is not exposed, whatever the model gains later.
   *
   * @param data - The completed data.
   * @param schema - The contract.
   * @param context - The resource context.
   * @returns The projected value.
   * @throws {ResourceContractError} When the data breaks the contract and the policy is `throw`.
   */
  protected async project (data: unknown, schema: ResourceSchema, context: ResourceContext): Promise<unknown> {
    // From the context first, so an application may hand a projection its own dialect for one call;
    // otherwise this module's own reader, which is why exposing data needs no validation module.
    const checker = (context.checker as IContractChecker | undefined) ?? this.checker
    const result = checker.check(schema, data)

    if (result.success) { return result.value }

    const issues = result.issues ?? []
    const detail = issues
      .map((issue) => `${issue.path.length > 0 ? issue.path.join('.') : '(root)'}: ${issue.message}`)
      .join('; ')
    const message =
      `${this.constructor.name} produced data that does not match the contract it publishes: ${detail}. ` +
      'The response was not sent, because a caller cannot detect a broken contract and a consumer ' +
      'generated from it would break on the field that is missing.'

    // Configured per application, and per projection when a caller of `item()` wants to override it.
    const policy = (context.onViolation as ContractViolationPolicy | undefined) ?? this.onViolation

    if (policy === 'warn') {
      // Availability over integrity, chosen explicitly by configuration: the caller still gets what
      // the schema could parse, and the breach is on the record.
      console.warn(`[@stone-js/resources] ${message}`)
      return data
    }

    throw new ResourceContractError(message, { issues, metadata: { context } })
  }

  /**
   * Include a value only when `condition` holds (otherwise the field is dropped).
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
   * Include a value only when the relation was requested through `context.include`.
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

/**
 * The two optional hooks, declared as methods rather than as properties.
 *
 * A property-typed function is contravariant on its parameters, and TypeScript refuses a method where
 * the base declared a property. Between them, those two rules meant a subclass could neither narrow the
 * context nor write `async data (model, context) {}`, which is the form every example uses. Declared
 * here, on an interface merged with the class, both forms are accepted and the type parameters actually
 * reach the signature a subclass writes.
 */
// A merged interface must repeat the class's type parameter list exactly, so `Output` is named here
// without being used in a signature.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface Resource<Model, Output extends ResourceOutput, EventType, PrincipalType> {
  /**
   * Optional: shape or complete the model before it meets the schema.
   *
   * A method signature, deliberately, against the repository's own lint rule: a property-typed
   * function is contravariant on its parameters, so a subclass narrowing the context was rejected, and
   * TypeScript separately refuses a method where the base declared a property, so
   * `async data (model, context) {}` was rejected too. The rule's soundness argument is theoretical for
   * an extension point; the cost was measured, in an application that could not type its resources.
   */
  // eslint-disable-next-line @typescript-eslint/method-signature-style
  data?(model: Model, context: ResourceContext<EventType, PrincipalType>): Promiseable<unknown>

  /**
   * Named subsets a caller may ask for. Override to expose fragments.
   */
  // eslint-disable-next-line @typescript-eslint/method-signature-style
  fragments?(context: ResourceContext<EventType, PrincipalType>): Record<string, ResourceSchema> | Promise<Record<string, ResourceSchema>>
}
