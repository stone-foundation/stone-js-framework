import { NodeCliAdapter } from './NodeCliAdapter'
import { IBlueprint, AdapterResolver } from '@stone-js/core'

/**
 * Adapter resolver for generic Node Cli adapter.
 *
 * Creates and configures an `NodeCliAdapter` for handling generic events in Node Cli.
 *
 * @param blueprint - The `IBlueprint` providing configuration and dependencies.
 * @returns An `NodeCliAdapter` instance.
 */
export const nodeCliAdapterResolver: AdapterResolver = (blueprint: IBlueprint) => {
  return NodeCliAdapter.create(blueprint)
}
