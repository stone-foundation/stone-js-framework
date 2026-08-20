import { ResourceContext, ResourceOutput } from './declarations'

/**
 * Returns a copy of `object` without any `undefined` values (so conditional fields simply vanish).
 *
 * @param object - The object to clean.
 * @returns A copy without undefined values.
 */
export function stripUndefined<T extends ResourceOutput> (object: T): Partial<T> {
  const out: Partial<T> = {}
  for (const key of Object.keys(object) as Array<keyof T>) {
    if (object[key] !== undefined) { out[key] = object[key] }
  }
  return out
}

/**
 * Keeps only the given keys of an object (ignoring keys that are absent).
 *
 * @param object - The source object.
 * @param keys - The keys to keep.
 * @returns A new object with only those keys.
 */
export function only<T extends ResourceOutput> (object: T, keys: string[]): Partial<T> {
  const set = new Set(keys)
  const out: Partial<T> = {}
  for (const key of Object.keys(object) as Array<keyof T & string>) {
    if (set.has(key)) { out[key] = object[key] }
  }
  return out
}

/**
 * Returns a copy of an object without the given keys.
 *
 * @param object - The source object.
 * @param keys - The keys to drop.
 * @returns A new object without those keys.
 */
export function except<T extends ResourceOutput> (object: T, keys: string[]): Partial<T> {
  const set = new Set(keys)
  const out: Partial<T> = {}
  for (const key of Object.keys(object) as Array<keyof T & string>) {
    if (!set.has(key)) { out[key] = object[key] }
  }
  return out
}

/**
 * Applies a sparse fieldset to an output: strips undefined, then narrows to the requested fields
 * (when any were requested).
 *
 * @param output - The transformed output.
 * @param fields - The requested fields (optional).
 * @returns The filtered output.
 */
export function applyFields<T extends ResourceOutput> (output: T, fields?: string[]): Partial<T> {
  const clean = stripUndefined(output)
  return fields !== undefined && fields.length > 0 ? only(clean as T, fields) : clean
}

/**
 * Build a {@link ResourceContext} from an incoming event.
 *
 * The parameter names are configuration, not convention: an API that already answers `?view=` or
 * `?only=` keeps its own vocabulary instead of gaining a second one. Defaults are `fields`, `include`
 * and `view`.
 *
 * The authenticated principal is read too, because deciding what a caller may see is the most common
 * reason two callers get different shapes — and a resource that cannot see who is asking has to be
 * told by the handler, which is exactly the plumbing this module exists to remove.
 *
 * Agnostic: the event only needs `get(key)`.
 *
 * @param event - Anything with `get(key)` (an `IncomingHttpEvent`, a URL search wrapper, …).
 * @param blueprint - The blueprint carrying the parameter names, when there is one.
 * @param extra - Extra context to merge in.
 * @returns The resource context.
 */
export function contextFromEvent (
  event: { get: <T>(key: string, fallback?: T) => T, getUser?: <T>() => T },
  blueprint?: { get: <T>(key: string, fallback?: T) => T },
  extra: ResourceContext = {}
): ResourceContext {
  const names = blueprint?.get<Record<string, string>>('stone.resources.params', {}) ?? {}
  const fragment = event.get<string>(names.fragment ?? 'view', '')

  return {
    ...extra,
    event,
    // `getUser()` and not `get('user')`: the principal is set through a resolver, not as metadata, so
    // the generic accessor never reaches it. Duck-typed, because the kernel is agnostic and an event
    // without a user simply has no such method.
    principal: event.getUser?.(),
    fields: splitCsv(event.get<string>(names.fields ?? 'fields', '')),
    include: splitCsv(event.get<string>(names.include ?? 'include', '')),
    fragment: fragment.length > 0 ? fragment : undefined
  }
}

/**
 * Split a comma-separated string into a trimmed, non-empty list (or `undefined` when empty).
 *
 * @param value - The CSV string.
 * @returns The list, or `undefined`.
 */
function splitCsv (value: string): string[] | undefined {
  const parts = String(value).split(',').map((part) => part.trim()).filter((part) => part.length > 0)
  return parts.length > 0 ? parts : undefined
}
