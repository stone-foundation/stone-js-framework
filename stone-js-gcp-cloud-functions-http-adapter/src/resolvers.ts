import { GcpCloudFunctionsHttpAdapter } from './GcpCloudFunctionsHttpAdapter'
import { IBlueprint, AdapterResolver } from '@stone-js/core'

/**
 * Resolver function for the HTTP adapter.
 *
 * This function creates a `GcpCloudFunctionsHttpAdapter` instance, which acts as the bridge between the HTTP server and the Stone.js framework.
 *
 * @param blueprint - The application blueprint for dependency resolution.
 * @returns An `AdapterResolver` instance for managing HTTP interactions.
 */
export const gcpCloudFunctionsHttpAdapterResolver: AdapterResolver = (blueprint: IBlueprint) => {
  return GcpCloudFunctionsHttpAdapter.create(blueprint)
}
