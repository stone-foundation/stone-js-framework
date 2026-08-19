import { SchemaInput } from './declarations'
import { ValidationRules } from './validateEvent'

/**
 * What a route may declare under `validation`.
 *
 * A single schema validates the **body**, which is what almost every route means:
 *
 * ```ts
 * @Post('/users', { validation: CreateUserSchema })
 * ```
 *
 * A map validates several sources at once, each under its own key:
 *
 * ```ts
 * @Get('/users', { validation: { query: ListQuerySchema, params: IdSchema } })
 * ```
 */
export type RouteValidationInput = SchemaInput | ValidationRules

/** The source a rule reads from, when it is one of the ones an event exposes wholesale. */
export type ValidationSource = 'body' | 'query' | 'params'

/**
 * A duck-typed event: the kernel is agnostic, so this reads whatever the context happens to expose
 * and never imports an HTTP type.
 */
interface SourceEvent {
  body?: unknown
  params?: unknown
  query?: unknown
  getBody?: <T>() => T | undefined
  get: <T>(key: string) => T | undefined
}

/**
 * Whether a value is a schema rather than a map of schemas.
 *
 * A schema is recognised by what it can do, not by what it is: every engine Stone.js accepts exposes
 * one of `validate`, `~standard`, `parse` or `safeParse`. Anything else is treated as a map of
 * sources, which is why `{ body: X }` and `X` can share one option without ambiguity.
 *
 * @param value - The declared value.
 * @returns Whether it is a single schema.
 */
export function isSchemaLike (value: unknown): value is SchemaInput {
  if (typeof value !== 'object' || value === null) { return typeof value === 'function' }
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.validate === 'function' ||
    typeof candidate.parse === 'function' ||
    typeof candidate.safeParse === 'function' ||
    candidate['~standard'] !== undefined
  )
}

/**
 * Normalise what a route declared into rules keyed by source.
 *
 * A bare schema becomes `{ body: schema }`, because a route that names one schema means its payload.
 *
 * @param declared - What the route declared.
 * @returns The rules, keyed by source.
 */
export function toValidationRules (declared: RouteValidationInput): ValidationRules {
  return isSchemaLike(declared) ? { body: declared } : declared
}

/**
 * Read a whole source off an event.
 *
 * `body`, `query` and `params` are read as wholes, because a schema validates the payload, not one
 * field of it. `event.get('body')` would look for a field *named* body inside the body, which is a
 * different question. Any other key falls back to `event.get`, so a context that exposes something
 * else (a CLI argument set, a message attribute) validates just as well.
 *
 * `query` is normalised from `URLSearchParams` to a plain object, since that is what a schema can
 * parse.
 *
 * @param event - The incoming event.
 * @param source - The source name.
 * @returns The value to validate.
 */
export function readSource (event: SourceEvent, source: string): unknown {
  if (source === 'body') { return event.getBody?.() ?? event.body }
  if (source === 'params') { return event.params ?? event.get(source) }
  if (source === 'query') {
    const query = event.query ?? event.get(source)
    return query instanceof URLSearchParams ? Object.fromEntries(query) : query
  }
  return event.get(source)
}

/**
 * The metadata key a validated source is published under.
 *
 * `body` becomes `validatedBody`, `query` becomes `validatedQuery`. The name is predictable on
 * purpose: a handler reads `event.get<CreateUser>('validatedBody')` and needs no helper, no import
 * and nothing to remember beyond the source it declared.
 *
 * @param source - The source name.
 * @returns The metadata key.
 */
export function metadataKeyFor (source: string): string {
  return `validated${source.charAt(0).toUpperCase()}${source.slice(1)}`
}
