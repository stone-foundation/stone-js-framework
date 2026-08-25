/**
 * Values that outlive the event, built once per process.
 *
 * The container is an **execution context**: it is created for one event and thrown away with it,
 * and every service provider registers again with the next one. That is the design, and it is what
 * makes an event's work isolated from the next event's.
 *
 * The consequence catches everyone once. A provider that builds something holding state, a cache
 * store, a rate limit counter, a queue of pending jobs, a set of open subscriptions, rebuilds it
 * on every event, and the state is gone before anything can read it back. Nothing throws, nothing
 * logs, and a test suite stays green because a test builds it once. Two shipped modules failed
 * exactly this way: a rate limiter that refused nothing, and a cache that never returned a hit.
 *
 * State that must outlive the event does not belong to the container. It belongs to the process,
 * and this is how a module says so:
 *
 * ```ts
 * register (): void {
 *   const manager = perProcess(CacheManager, () => CacheManager.create(config.default))
 *   this.container.instanceIf(CacheManager, manager)
 * }
 * ```
 *
 * The container still hands the value out, so nothing changes for whoever injects it. What changes
 * is that the same value is handed out to every event.
 *
 * This is not a general-purpose cache, and nothing here is ever evicted: it holds one value per key
 * for the life of the process. Use it for what a module needs exactly one of.
 */

/**
 * The values held for this process, one per key.
 *
 * Module-level rather than global on purpose: a bundle that is loaded twice, a worker thread, or a
 * fresh serverless instance each get their own, which is the boundary they already are.
 */
const values = new Map<unknown, unknown>()

/**
 * The value for this key, building it the first time it is asked for.
 *
 * The factory runs at most once per process. Later calls answer what it built, whatever container
 * they are asked from.
 *
 * @param key - What identifies the value. A class or a symbol reads best, and any value works.
 * @param factory - How to build it, called only when nothing is held yet.
 * @returns The value held for this key.
 *
 * @example
 * ```ts
 * const manager = perProcess(QueueManager, () => QueueManager.create(config.default))
 * ```
 */
export const perProcess = <T>(key: unknown, factory: () => T): T => {
  if (!values.has(key)) {
    values.set(key, factory())
  }

  return values.get(key) as T
}

/**
 * Replace what is held for a key, or drop it.
 *
 * For a test that needs a clean process, and for an application that deliberately rebuilds
 * something. Passing no value drops the key, so the next {@link perProcess} builds again.
 *
 * @param key - What identifies the value.
 * @param value - What to hold, or nothing to drop it.
 */
export const setPerProcess = <T>(key: unknown, value?: T): void => {
  value === undefined ? values.delete(key) : values.set(key, value)
}

/**
 * Whether something is already held for this key.
 *
 * @param key - What identifies the value.
 * @returns True when a value is held.
 */
export const hasPerProcess = (key: unknown): boolean => values.has(key)

/**
 * Drop everything held.
 *
 * A test-suite convenience: one call between tests, rather than one per module. An application has
 * no reason to call it, since dropping a limiter's counters or a cache's contents mid-flight is
 * exactly the failure this file exists to prevent.
 */
export const clearProcessScope = (): void => {
  values.clear()
}
