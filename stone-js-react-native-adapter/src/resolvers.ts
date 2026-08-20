import { IBlueprint, AdapterResolver } from '@stone-js/core'
import { ReactNativeAdapter } from './ReactNativeAdapter'

/**
 * Adapter resolver for the React Native adapter.
 *
 * @param blueprint - The blueprint providing configuration and dependencies.
 * @returns A `ReactNativeAdapter` instance.
 */
export const reactNativeAdapterResolver: AdapterResolver = (blueprint: IBlueprint) => {
  return ReactNativeAdapter.create(blueprint)
}
