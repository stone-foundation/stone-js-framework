import { NodeHttpAdapter } from './NodeHttpAdapter'
import { IBlueprint, AdapterResolver } from '@stone-js/core'

/**
 * Resolver function for the HTTP adapter.
 *
 * This function creates a `NodeHTTPAdapter` instance, which acts as the bridge between the HTTP server and the Stone.js framework.
 *
 * @param blueprint - The application blueprint for dependency resolution.
 * @returns An `AdapterResolver` instance for managing HTTP interactions.
 */
export const nodeHttpAdapterResolver: AdapterResolver = (blueprint: IBlueprint) => {
  return NodeHttpAdapter.create(blueprint)
}
