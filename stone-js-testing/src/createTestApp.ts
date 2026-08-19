import { StoneFactory } from '@stone-js/core'
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
  // Before the modules are imported: a `@Configuration` reading the environment runs at import time,
  // so loading the file afterwards would be too late to matter.
  if (options.envFile !== false) { loadTestEnv(options.envFile) }

  const appModules = options.modules ?? await discoverAppModules(options)

  const modules = [
    options.platform === undefined ? testAdapterBlueprint : testAdapterBlueprintFor(options.platform),
    ...(options.blueprint !== undefined ? [options.blueprint] : []),
    ...appModules,
    // Last, so a substitution wins over the registration it replaces.
    ...(options.bindings !== undefined ? [testBindingsProvider(options.bindings)] : [])
  ]

  return await StoneFactory.create({ modules }).run<TestClient>()
}
