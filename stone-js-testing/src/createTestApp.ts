import { clearProcessScope, StoneFactory } from '@stone-js/core'
import { TestClient } from './TestClient'
import { loadTestEnv } from './loadTestEnv'
import { TestAppOptions } from './declarations'
import { discoverAppModules } from './discoverModules'
import { testBindingsProvider } from './bindingsProvider'
import { testAdapterBlueprint, testAdapterBlueprintFor } from './options/TestAdapterBlueprint'

/**
 * Boots a Stone.js application in-memory for testing.
 *
 * It runs the real bootstrap (blueprint introspection, providers, hooks) via `StoneFactory`, but
 * swaps in the {@link TestAdapter} so nothing binds a port. You get a {@link TestClient} whose
 * `send(event)` dispatches through the full kernel — the same path production uses.
 *
 * Called with no modules, it **discovers them**, from the same files the CLI builds. That is not a
 * convenience: a hand-written list drifts, and it drifts silently. A forgotten handler answers 404
 * and reads as a routing bug; a forgotten `@Configuration` makes the whole suite validate behaviour
 * production does not have. Listing modules explicitly stays possible, as an override.
 *
 * @param options - What to boot, and what to substitute.
 * @returns A booted test client.
 *
 * @example
 * ```ts
 * import { createTestApp } from '@stone-js/testing'
 * // Subpath on purpose: the event factories are platform-specific, and an agnostic application
 * // should not carry the HTTP one. `makeIncomingEvent` (from the main entry) is NOT a substitute:
 * // it builds the generic event, with no URL and no HTTP methods.
 * import { makeIncomingHttpEvent } from '@stone-js/testing/http'
 *
 * const app = await createTestApp()                                  // discovers app/**
 * const app = await createTestApp({ appDir: 'src' })                 // another layout
 * const app = await createTestApp({ modules: [Application, Tasks] }) // exactly these
 * const app = await createTestApp({ bindings: { clock: fixedClock } })
 *
 * const response = await app.send(makeIncomingHttpEvent({ method: 'GET', url: '/tasks' }))
 * expect(response.statusCode).toBe(200)
 * expect(response.json()).toEqual([{ id: 1 }])
 * ```
 */
export async function createTestApp (options: TestAppOptions = {}): Promise<TestClient> {
  // A test application is a new process, so it starts with nothing held per process. Without this,
  // a module that legitimately keeps state across events, a cache's stores, a limiter's counters,
  // would carry it from one test's application into the next one's, and a suite would pass or fail
  // on the order its files happened to run in.
  clearProcessScope()

  // Before the modules are imported: a `@Configuration` reading the environment runs at import time,
  // so loading the file afterwards would be too late to matter.
  if (options.envFile !== false) { loadTestEnv(options.envFile) }

  const appModules = options.modules ?? await discoverAppModules(options)

  const modules = [
    options.platform === undefined ? testAdapterBlueprint : testAdapterBlueprintFor(options.platform),
    ...appModules,
    // After the application's own modules, so a test can force a value. Merged before it, the option
    // did nothing: `@StoneApp` carries the default blueprint, which sets nearly every key.
    ...(options.blueprint !== undefined ? [options.blueprint] : []),
    // Last, so a substitution wins over the registration it replaces.
    ...(options.bindings !== undefined ? [testBindingsProvider(options.bindings)] : [])
  ]

  return await StoneFactory.create({ modules }).run<TestClient>()
}
