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
 * Builds a {@link ResourceContext} from an incoming event's `fields` and `include` query
 * parameters (comma-separated). Agnostic: the event only needs a `get(key)` method.
 *
 * @param event - Anything with `get(key)` (an `IncomingHttpEvent`, a URL search wrapper, …).
 * @param extra - Extra context to merge in.
 * @returns The resource context.
 */
export function contextFromEvent (event: { get: <T>(key: string, fallback?: T) => T }, extra: ResourceContext = {}): ResourceContext {
  return {
    ...extra,
    fields: splitCsv(event.get<string>('fields', '')),
    include: splitCsv(event.get<string>('include', ''))
  }
}

/**
 * Splits a comma-separated string into a trimmed, non-empty list (or `undefined` when empty).
 *
 * @param value - The CSV string.
 * @returns The list, or `undefined`.
 */
function splitCsv (value: string): string[] | undefined {
  const parts = value.split(',').map((part) => part.trim()).filter((part) => part.length > 0)
  return parts.length > 0 ? parts : undefined
}
