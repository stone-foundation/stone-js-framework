import { FetchAdapter } from './FetchAdapter'
import { AdapterResolver, IBlueprint } from '@stone-js/core'

/**
 * Adapter resolver for the Fetch adapter.
 *
 * @param blueprint - The application blueprint.
 * @returns A `FetchAdapter` instance.
 */
export const fetchAdapterResolver: AdapterResolver = (blueprint: IBlueprint) => {
  return FetchAdapter.create(blueprint)
}
