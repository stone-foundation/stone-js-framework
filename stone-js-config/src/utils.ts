/**
 * Internal, dependency-free helpers for the Config store.
 *
 * Replaces `lodash-es` (get/set/has) and `deepmerge` with small, auditable functions that:
 * - support dotted (`'a.b.c'`) and array (`['a','b']`) key paths;
 * - guard every write against prototype pollution (`__proto__`/`constructor`/`prototype`);
 * - preserve special objects (Date, Map, Set, RegExp, class instances) on merge/clone
 *   instead of flattening them to plain objects.
 */

/** Segment names that must never be written through (prototype pollution guard). */
const POLLUTION_KEYS = new Set<string>(['__proto__', 'constructor', 'prototype'])

/**
 * Normalize a key into path segments.
 *
 * @param key - A dotted string, an array of segments, or a single symbol/number/string.
 * @returns The path segments.
 */
export function toSegments (key: PropertyKey | PropertyKey[]): PropertyKey[] {
  if (Array.isArray(key)) { return key }
  if (typeof key === 'string' && (key.includes('.') || key.includes('['))) {
    // Support dotted and bracket notation: `a.b[0].c` and `a['b'][0]` → ['a','b','0','c'].
    return key
      .replace(/\[["']?([^"'\]]+)["']?\]/g, '.$1')
      .split('.')
      .filter((segment) => segment !== '')
  }
  return [key]
}

/**
 * Is the value a plain object (created from `{}`/`Object.create(null)`), not a special object?
 *
 * @param value - The value to test.
 * @returns True for plain objects only.
 */
export function isPlainObject (value: unknown): value is Record<PropertyKey, unknown> {
  if (value === null || typeof value !== 'object') { return false }
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

/**
 * Is the value object-like (any non-null object, including arrays and special objects)?
 *
 * @param value - The value to test.
 * @returns True for any non-null object.
 */
export function isObjectLike (value: unknown): value is object {
  return value !== null && typeof value === 'object'
}

/**
 * Deep-clone plain objects and arrays; keep special objects (Date, Map, Set, class
 * instances, functions) and primitives by reference.
 *
 * @param value - The value to clone.
 * @returns A structural clone.
 */
export function cloneValue<T> (value: T): T {
  if (Array.isArray(value)) { return value.map((v) => cloneValue(v)) as unknown as T }
  if (isPlainObject(value)) {
    const out: Record<PropertyKey, unknown> = {}
    for (const key of Object.keys(value)) {
      if (POLLUTION_KEYS.has(key)) { continue }
      out[key] = cloneValue((value as Record<PropertyKey, unknown>)[key])
    }
    return out as unknown as T
  }
  return value
}

/**
 * Read a value at a key path, returning a fallback when absent.
 *
 * @param obj - The source object.
 * @param key - The key path.
 * @param fallback - The value returned when the path is absent.
 * @returns The value or the fallback.
 */
export function getPath<T = unknown> (obj: unknown, key: PropertyKey | PropertyKey[], fallback?: T): T | undefined {
  let current: any = obj
  for (const seg of toSegments(key)) {
    if (current === null || current === undefined || typeof current !== 'object') { return fallback }
    current = current[seg]
  }
  return current === undefined ? fallback : current
}

/**
 * Does the object have an own value at the key path?
 *
 * @param obj - The source object.
 * @param key - The key path.
 * @returns True if every segment exists as an own property.
 */
export function hasPath (obj: unknown, key: PropertyKey | PropertyKey[]): boolean {
  let current: any = obj
  for (const seg of toSegments(key)) {
    if (current === null || current === undefined || typeof current !== 'object') { return false }
    if (!Object.prototype.hasOwnProperty.call(current, seg)) { return false }
    current = current[seg]
  }
  return true
}

/**
 * Write a value at a key path, creating intermediate plain objects, and refusing any
 * segment that would pollute the prototype chain.
 *
 * @param obj - The target object (mutated).
 * @param key - The key path.
 * @param value - The value to set.
 */
export function setPath (obj: object, key: PropertyKey | PropertyKey[], value: unknown): void {
  const segments = toSegments(key)
  let current: any = obj

  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i]
    if (typeof seg === 'string' && POLLUTION_KEYS.has(seg)) { return }
    if (current[seg] === null || current[seg] === undefined || typeof current[seg] !== 'object') {
      current[seg] = {}
    }
    current = current[seg]
  }

  const last = segments[segments.length - 1]
  if (typeof last === 'string' && POLLUTION_KEYS.has(last)) { return }
  current[last] = value
}

/**
 * Deep-merge two values. Plain objects merge recursively, arrays concatenate, and every
 * other value (Date, Map, Set, class instance, primitive) is replaced by the source
 * (cloned for plain structures, kept by reference otherwise). Pollution keys are skipped.
 *
 * @param target - The base value.
 * @param source - The overriding value.
 * @returns The merged value.
 */
export function deepMerge<T> (target: T, source: unknown): T {
  if (Array.isArray(target) && Array.isArray(source)) {
    return [...target, ...source] as unknown as T
  }

  if (isPlainObject(target) && isPlainObject(source)) {
    const out: Record<PropertyKey, unknown> = { ...target }
    for (const key of Object.keys(source)) {
      if (POLLUTION_KEYS.has(key)) { continue }
      const sourceValue = source[key]
      const targetValue = out[key]
      out[key] = (isPlainObject(targetValue) && isPlainObject(sourceValue)) || (Array.isArray(targetValue) && Array.isArray(sourceValue))
        ? deepMerge(targetValue, sourceValue)
        : cloneValue(sourceValue)
    }
    return out as unknown as T
  }

  return cloneValue(source) as T
}
