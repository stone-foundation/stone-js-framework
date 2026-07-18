import { BrowserAdapter } from './BrowserAdapter'
import { IBlueprint, AdapterResolver } from '@stone-js/core'

/**
 * Adapter resolver for generic Browser adapter.
 *
 * Creates and configures an `BrowserAdapter` for handling generic events in Browser.
 *
 * @param blueprint - The `IBlueprint` providing configuration and dependencies.
 * @returns An `BrowserAdapter` instance.
 */
export const browserAdapterResolver: AdapterResolver = (blueprint: IBlueprint) => {
  return BrowserAdapter.create(blueprint)
}
