import { TestAdapter } from '../TestAdapter'
import { TEST_PLATFORM } from '../declarations'
import { defaultKernelResolver, IBlueprint, StoneBlueprint } from '@stone-js/core'

/** The test adapter configuration entry. */
const testAdapter = {
  current: true,
  default: false,
  variant: 'server',
  platform: TEST_PLATFORM,
  middleware: [],
  resolver: (blueprint: IBlueprint) => TestAdapter.create(blueprint),
  eventHandlerResolver: defaultKernelResolver,
  errorHandlers: {}
}

/**
 * Blueprint that installs the in-memory test adapter.
 *
 * It registers the adapter in `stone.adapters` with `current: true` (so it wins over any real
 * platform adapter a full app declares, once the core selects the current adapter) AND sets
 * `stone.adapter` directly (so a minimal app — no `@StoneApp` blueprint pipeline — still resolves
 * an adapter). Either way, `createTestApp` boots without binding a port.
 */
export const testAdapterBlueprint: Partial<StoneBlueprint> = {
  stone: {
    adapter: testAdapter,
    adapters: [testAdapter]
  } as unknown as StoneBlueprint['stone']
}
