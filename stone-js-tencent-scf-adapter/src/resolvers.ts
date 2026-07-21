import { TencentScfAdapter } from './TencentScfAdapter'
import { AdapterResolver, IBlueprint } from '@stone-js/core'

/**
 * Adapter resolver for generic Tencent SCF adapter.
 *
 * Creates and configures an `TencentScfAdapter` for handling generic events in Tencent SCF.
 *
 * @param blueprint - The `IBlueprint` providing configuration and dependencies.
 * @returns An `TencentScfAdapter` instance.
 */
export const tencentScfAdapterResolver: AdapterResolver = (blueprint: IBlueprint) => {
  return TencentScfAdapter.create(blueprint)
}
