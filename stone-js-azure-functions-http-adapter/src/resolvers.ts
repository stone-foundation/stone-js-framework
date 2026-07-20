import { AzureFunctionsHttpAdapter } from './AzureFunctionsHttpAdapter'
import { AdapterResolver, IBlueprint } from '@stone-js/core'

/**
 * Adapter resolver for the AzureFunctionsHttp adapter.
 *
 * @param blueprint - The application blueprint.
 * @returns A `AzureFunctionsHttpAdapter` instance.
 */
export const azureFunctionsHttpAdapterResolver: AdapterResolver = (blueprint: IBlueprint) => {
  return AzureFunctionsHttpAdapter.create(blueprint)
}
