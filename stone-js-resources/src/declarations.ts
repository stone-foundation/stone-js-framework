/**
 * The context that shapes a transformation: which fields the client asked for, which relations to
 * include, and any extra data (the current user, the event, …) a resource may consult.
 *
 * It is intentionally open so resources can read whatever they need while staying agnostic.
 */
export interface ResourceContext {
  /** Requested sparse fieldset — when set, the output is limited to these top-level keys. */
  fields?: string[]
  /** Requested relations to embed. */
  include?: string[]
  /** Anything else a resource needs (e.g. the authenticated principal). */
  [key: string]: unknown
}

/** A plain, serialisable output object. */
export type ResourceOutput = Record<string, unknown>

/**
 * A `{ data, meta }` envelope around a transformed item or collection.
 */
export interface ResourceEnvelope<T> {
  data: T
  meta?: Record<string, unknown>
}

/**
 * The resource contract: transform a model (or a collection) into its public representation.
 */
export interface IResource<Model = unknown, Output extends ResourceOutput = ResourceOutput> {
  /** Transform one model into its public shape (before field filtering). */
  toArray: (model: Model, context: ResourceContext) => Output
  /** Transform one model, applying sparse fieldsets and dropping undefined fields. */
  item: (model: Model, context?: ResourceContext) => Partial<Output>
  /** Transform a collection. */
  collection: (models: Model[], context?: ResourceContext) => Array<Partial<Output>>
  /** Wrap a model or collection in a `{ data, meta }` envelope. */
  response: (models: Model | Model[], context?: ResourceContext, meta?: Record<string, unknown>) => ResourceEnvelope<Partial<Output> | Array<Partial<Output>>>
}
