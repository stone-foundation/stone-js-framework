import { AlibabaFcAdapter } from './AlibabaFcAdapter'
import { AdapterResolver, IBlueprint } from '@stone-js/core'

/**
 * Adapter resolver for generic Alibaba FC adapter.
 *
 * Creates and configures an `AlibabaFcAdapter` for handling generic events in Alibaba FC.
 *
 * @param blueprint - The `IBlueprint` providing configuration and dependencies.
 * @returns An `AlibabaFcAdapter` instance.
 */
export const alibabaFcAdapterResolver: AdapterResolver = (blueprint: IBlueprint) => {
  return AlibabaFcAdapter.create(blueprint)
}
