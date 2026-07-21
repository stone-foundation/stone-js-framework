import { AdapterResolver, IBlueprint } from '@stone-js/core'
import { TencentScfHttpAdapter } from './TencentScfHttpAdapter'

/**
 * Adapter resolver for Tencent SCF HTTP adapter.
 *
 * Creates and configures an `TencentScfHttpAdapter` for handling HTTP events in Tencent SCF.
 *
 * @param blueprint - The `IBlueprint` providing configuration and dependencies.
 * @returns An `TencentScfHttpAdapter` instance.
 */
export const tencentScfHttpAdapterResolver: AdapterResolver = (blueprint: IBlueprint) => {
  return TencentScfHttpAdapter.create(blueprint)
}
