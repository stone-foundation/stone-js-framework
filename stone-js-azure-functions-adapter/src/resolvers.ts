import { AzureFunctionsAdapter } from './AzureFunctionsAdapter'
import { AdapterResolver, IBlueprint } from '@stone-js/core'

/**
 * Adapter resolver for generic Azure Functions adapter.
 *
 * Creates and configures an `AzureFunctionsAdapter` for handling generic events in Azure Functions.
 *
 * @param blueprint - The `IBlueprint` providing configuration and dependencies.
 * @returns An `AzureFunctionsAdapter` instance.
 */
export const azureFunctionsAdapterResolver: AdapterResolver = (blueprint: IBlueprint) => {
  return AzureFunctionsAdapter.create(blueprint)
}
