import type { CacheKeyOption } from './declarations'
/**
 * Run `factory` for `key` at most once at a time: concurrent calls share the in-flight promise,
 * so a cold key is never computed twice under a burst (cache stampede / dogpile protection).
 *
 * @param inflight - The shared in-flight map.
 * @param key - The cache key.
 * @param factory - The value producer.
 * @returns The produced value.
 */
export async function singleFlight<T> (inflight: Map<string, Promise<any>>, key: string, factory: () => Promise<T>): Promise<T> {
  const pending = inflight.get(key)
  if (pending !== undefined) { return await pending as T }

  const promise = (async () => await factory())()
  inflight.set(key, promise)

  try {
    return await promise
  } finally {
    inflight.delete(key)
  }
}

/**
 * A small, stable, non-cryptographic hash (FNV-1a) used to derive default cache keys from a
 * method's arguments. Deterministic across runs; collisions are irrelevant for cache keying.
 *
 * @param input - The string to hash.
 * @returns An 8-char hex hash.
 */
export function hash (input: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

/**
 * Build a default cache key for a decorated method: `Class.method:<hash(args)>`.
 *
 * @param scope - The class/method scope (e.g. `'UserService.getName'`).
 * @param args - The call arguments.
 * @returns The derived key.
 */
export function defaultKey (scope: string, args: unknown[]): string {
  let serialized: string
  try {
    serialized = JSON.stringify(args)
  } catch {
    serialized = String(args)
  }
  return `${scope}:${hash(serialized)}`
}

/**
 * Resolve a module's default export across ESM/CJS interop (`mod.default` or the module itself).
 *
 * @param mod - The imported module namespace.
 * @returns The default export.
 */
export function resolveModuleDefault<T = any> (mod: any): T {
  return (mod?.default ?? mod) as T
}

/**
 * Resolve the cache key for a decorated method call: an explicit string, a function of the
 * arguments, or the derived `Class.method:<hash(args)>` default.
 *
 * @param key - The configured key option (if any).
 * @param self - The instance the method ran on (for the class name).
 * @param methodName - The decorated method's name.
 * @param args - The call arguments.
 * @returns The resolved cache key.
 */
export function resolveDecoratorKey (key: CacheKeyOption | undefined, self: any, methodName: string, args: unknown[]): string {
  if (typeof key === 'string') { return key }
  if (typeof key === 'function') { return key(...args) }
  const scope = `${String(self?.constructor?.name ?? 'Cache')}.${methodName}`
  return defaultKey(scope, args)
}
