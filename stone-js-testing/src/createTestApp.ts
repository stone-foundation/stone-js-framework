import { StoneFactory } from '@stone-js/core'
import { TestClient } from './TestClient'
import { TestAppOptions } from './declarations'
import { testAdapterBlueprint } from './options/TestAdapterBlueprint'

/**
 * Boots a Stone.js application in-memory for testing.
 *
 * It runs the real bootstrap (blueprint introspection, providers, hooks) via `StoneFactory`, but
 * swaps in the {@link TestAdapter} so nothing binds a port. You get a {@link TestClient} whose
 * `send(event)` dispatches through the full kernel — the same path production uses.
 *
 * @param options - The modules/blueprint to boot.
 * @returns A booted test client.
 *
 * @example
 * ```ts
 * const app = await createTestApp({ modules: [Application, TasksController, TaskService] })
 * const response = await app.send(makeIncomingHttpEvent({ method: 'GET', url: '/tasks' }))
 * expect(response.statusCode).toBe(200)
 * ```
 */
export async function createTestApp (options: TestAppOptions = {}): Promise<TestClient> {
  const modules = [
    testAdapterBlueprint,
    ...(options.blueprint !== undefined ? [options.blueprint] : []),
    ...(options.modules ?? [])
  ]

  return await StoneFactory.create({ modules }).run<TestClient>()
}
