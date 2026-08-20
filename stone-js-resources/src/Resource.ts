import { applyFields } from './helpers'
import { ResourceContractError } from './errors/ResourceContractError'
import {
  ContractViolationPolicy, IResource, ResourceContext, ResourceEnvelope, ResourceOutput, ResourceSchema
} from './declarations'

/**
 * The slice of `@stone-js/validation` a resource needs, declared structurally.
 *
 * Structural on purpose: a resource validates output with the same engine the application validates
 * input with, in whatever dialect it already uses, and this package does not have to import that one
 * to say so.
 */
export interface SchemaValidator {
  validate: <T>(schema: any, data: unknown) => { success: boolean, value?: T, issues?: Array<{ message: string, path: Array<string | number> }> }
}

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
 *   constructor ({ validator, posts }: { validator: SchemaValidator, posts: PostService }) {
 *     super({ validator })
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
export abstract class Resource<Model = unknown, Output extends ResourceOutput = ResourceOutput> implements IResource<Model, Output> {
  private readonly validator?: SchemaValidator
  private readonly onViolation: ContractViolationPolicy

  /**
   * @param dependencies - Auto-wired services. `validator` comes from `@stone-js/validation`; without
   *                       it a resource still projects, but it cannot check its own promise, so it
   *                       says so rather than pretending to have checked.
   */
  constructor (dependencies: { validator?: SchemaValidator, onViolation?: ContractViolationPolicy } = {}) {
    this.validator = dependencies.validator
    this.onViolation = dependencies.onViolation ?? 'throw'
  }

  /**
   * The contract: what this resource exposes.
   *
   * @param context - The resource context.
   * @returns The schema.
   */
  abstract schema (context: ResourceContext): ResourceSchema | Promise<ResourceSchema>

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
  async item (model: Model, context: ResourceContext = {}): Promise<Output> {
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
  async collection (models: Model[], context: ResourceContext = {}): Promise<Output[]> {
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
    context: ResourceContext = {},
    meta?: Record<string, unknown>
  ): Promise<ResourceEnvelope<Output | Output[]>> {
    const data = Array.isArray(models)
      ? await this.collection(models, context)
      : await this.item(models, context)

    return meta === undefined ? { data } : { data, meta }
  }

  /**
   * Optional: shape or complete the model before it meets the schema.
   *
   * `declare`, not a field: an uninitialised class field is *defined* as `undefined` on the instance,
   * which would shadow the very method a subclass wrote — the override would exist on the prototype
   * and never be reached. This states the type and emits nothing.
   */
  declare data?: (model: Model, context: ResourceContext) => unknown | Promise<unknown>

  /**
   * Named subsets a caller may ask for. Override to expose fragments.
   */
  declare fragments?: (context: ResourceContext) => Record<string, ResourceSchema> | Promise<Record<string, ResourceSchema>>

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
  protected async schemaFor (context: ResourceContext): Promise<ResourceSchema> {
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
    // From the context first: the middleware has the container, and an imperatively-defined resource
    // has no constructor for one to be injected into. A resource used directly in a service is handed
    // one the same way, or at construction.
    const validator = (context.validator as SchemaValidator | undefined) ?? this.validator

    if (validator === undefined) {
      throw new ResourceContractError(
        `${this.constructor.name} cannot check the contract it publishes: no validator was available. ` +
        'Enable `@stone-js/validation` — its `validator` service is what a resource holds its output ' +
        'against, and the route middleware passes it in — or hand one to the resource directly when ' +
        'projecting outside a request.'
      )
    }

    const result = validator.validate(schema, data)

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
