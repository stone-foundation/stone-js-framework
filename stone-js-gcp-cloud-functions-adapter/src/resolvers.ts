import { GcpCloudFunctionsAdapter } from './GcpCloudFunctionsAdapter'
import { AdapterResolver, IBlueprint } from '@stone-js/core'

/**
 * Adapter resolver for generic GCP Cloud Functions adapter.
 *
 * Creates and configures an `GcpCloudFunctionsAdapter` for handling generic events in GCP Cloud Functions.
 *
 * @param blueprint - The `IBlueprint` providing configuration and dependencies.
 * @returns An `GcpCloudFunctionsAdapter` instance.
 */
export const gcpCloudFunctionsAdapterResolver: AdapterResolver = (blueprint: IBlueprint) => {
  return GcpCloudFunctionsAdapter.create(blueprint)
}
