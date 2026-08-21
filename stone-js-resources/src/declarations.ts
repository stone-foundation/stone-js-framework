import { Promiseable } from '@stone-js/core'

/**
 * A schema, in whatever shape the application already writes them.
 *
 * Anything `@stone-js/validation` accepts is accepted here: a Standard Schema (Zod, Valibot, ArkType
 * and others), a Zod-like `safeParse`, or a native Stone.js schema. Resources do not define a schema
 * language; they use the one the application already validates its input with, so a contract is
 * written once in one dialect on both sides of the boundary.
 */
export type ResourceSchema = unknown

/**
 * The context a projection is given.
 *
 * Open on purpose: a resource reads whatever it needs, and the middleware fills in what the request
 * carried. The authenticated principal is part of it, because deciding what a caller may see is the
 * most common reason a projection differs between two callers.
 */
export interface ResourceContext<EventType = unknown, PrincipalType = unknown> {
  /** Requested sparse fieldset: narrows the output to these top-level keys. */
  fields?: string[]
  /** Requested relations to embed. */
  include?: string[]
  /** The requested fragment, when the caller asked for one by name. */
  fragment?: string
  /**
   * The authenticated principal, when the application has one.
   *
   * Typed by the resource, because deciding what a caller may see is the most common reason two
   * callers get different shapes, and `unknown` makes every such decision a cast. The default stays
   * `unknown`: this module never assumes an application has users, let alone what a user is.
   */
  principal?: PrincipalType
  /**
   * The event being answered, for a resource that needs more than the parameters above.
   *
   * Typed by the resource for the same reason, and `unknown` by default because the module is
   * agnostic of the platform the event came from.
   */
  event?: EventType
  /** Anything else a resource needs. */
  [key: string]: unknown
}

/** A plain, serialisable output object. */
export type ResourceOutput = Record<string, unknown>

/**
 * A `{ data, meta }` envelope around a projected item or collection.
 */
export interface ResourceEnvelope<T> {
  data: T
  meta?: Record<string, unknown>
}

/**
 * What a resource does: turn a domain model into the shape a caller is allowed to see, and say what
 * that shape is.
 *
 * Saying it is the point. A projection written as code answers "what does this return?" only by being
 * read and trusted; a projection written as a schema answers it to a person, to `@stone-js/openapi`,
 * and to the resource itself, which validates against it before anything leaves. One declaration, three
 * consumers, and no way for the documentation to drift from the response.
 */
export interface IResource<Model = unknown, Output = ResourceOutput> {
  /** The contract: the schema every projection is validated against and documented from. */
  schema: (context: ResourceContext) => ResourceSchema | Promise<ResourceSchema>

  /**
   * Named subsets a caller may ask for, each with its own schema.
   *
   * A fragment is not a filter: it is a contract of its own, documented and validated like the full
   * one. That is what makes `?view=summary` safe to expose.
   */
  fragments?: (context: ResourceContext) => Record<string, ResourceSchema> | Promise<Record<string, ResourceSchema>>

  /**
   * Optional hook to shape or complete the model before it meets the schema.
   *
   * Asynchronous, and resolved from the container, so it may reach any service: fetch a relation,
   * translate a label, compute a total. Whatever it returns is what the schema then validates.
   */
  data?: (model: Model, context: ResourceContext) => Promiseable<unknown>

  /** Project one model. */
  item: (model: Model, context?: ResourceContext) => Promise<Output>
  /** Project a collection. */
  collection: (models: Model[], context?: ResourceContext) => Promise<Output[]>
  /** Project into a `{ data, meta }` envelope. */
  response: (models: Model | Model[], context?: ResourceContext, meta?: Record<string, unknown>) => Promise<ResourceEnvelope<Output | Output[]>>
}

/** What to do when the data does not match the contract the resource published. */
export type ContractViolationPolicy = 'throw' | 'warn'
