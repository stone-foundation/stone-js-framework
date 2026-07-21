import { AlibabaFcHttpAdapter } from './AlibabaFcHttpAdapter'
import { AdapterResolver, IBlueprint } from '@stone-js/core'

/**
 * Adapter resolver for the AlibabaFcHttp adapter.
 *
 * @param blueprint - The application blueprint.
 * @returns A `AlibabaFcHttpAdapter` instance.
 */
export const alibabaFcHttpAdapterResolver: AdapterResolver = (blueprint: IBlueprint) => {
  return AlibabaFcHttpAdapter.create(blueprint)
}
