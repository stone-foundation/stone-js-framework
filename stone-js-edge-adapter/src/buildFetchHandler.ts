import { StoneFactory, StoneBlueprint } from '@stone-js/core'
import { fetchAdapterBlueprint } from '@stone-js/fetch-adapter'
import { EdgeAppOptions, FetchHandler } from './declarations'

/**
 * A blueprint fragment that forces the Fetch adapter to be the current adapter (`current: true`
 * wins over any real platform adapter the app declares), and sets it directly so a minimal app
 * still resolves an adapter.
 *
 * @returns The forced-fetch blueprint fragment.
 */
function forcedFetchBlueprint (): Partial<StoneBlueprint> {
  /* v8 ignore next -- `?? {}` is defensive: the fetch adapter always declares its adapter entry. */
  const base = fetchAdapterBlueprint.stone.adapters?.[0] ?? {}
  const current = { ...base, current: true, default: true }
  return { stone: { ...fetchAdapterBlueprint.stone, adapter: current, adapters: [current] } } as unknown as Partial<StoneBlueprint>
}

/**
 * Boots a Stone.js app and returns its Web-standard fetch handler.
 *
 * This is the foundation the platform `serve*` helpers build on: it runs the real bootstrap via
 * `StoneFactory` with the Fetch adapter forced current, yielding `(request, executionContext?)
 * => Promise<Response>`.
 *
 * @param options - The modules/blueprint to boot.
 * @returns The fetch handler.
 */
export async function buildFetchHandler (options: EdgeAppOptions = {}): Promise<FetchHandler> {
  const modules = [
    forcedFetchBlueprint(),
    ...(options.blueprint !== undefined ? [options.blueprint] : []),
    ...(options.modules ?? [])
  ]

  return await StoneFactory.create({ modules }).run<FetchHandler>()
}
