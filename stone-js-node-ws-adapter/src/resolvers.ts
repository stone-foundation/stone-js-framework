import { NodeWsAdapter } from './NodeWsAdapter'
import { AdapterResolver, IBlueprint } from '@stone-js/core'

/**
 * Adapter resolver for the Node.js WebSocket adapter.
 *
 * @param blueprint - The blueprint providing configuration and dependencies.
 * @returns A `NodeWsAdapter` instance.
 */
export const nodeWsAdapterResolver: AdapterResolver = (blueprint: IBlueprint) => {
  return NodeWsAdapter.create(blueprint)
}
