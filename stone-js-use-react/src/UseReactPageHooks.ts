import { ReactOutgoingResponse } from './declarations'
import { getResponseSnapshot } from './UseReactPageInternals'
import { IncomingBrowserEvent } from '@stone-js/browser-core'
import { IContainer, isFunction, isNotEmpty } from '@stone-js/core'
import { prepareFallbackErrorPage, prepareErrorPage, preparePage } from './UseReactPageRenderer'

/**
 * Options for onPreparingResponse hook.
 */
export interface OnPreparingResponseOptions {
  container: IContainer
  event: IncomingBrowserEvent
  response: ReactOutgoingResponse
}

/**
 * Hook that runs just before preparing the response.
 *
 * @param context - The context of the hook.
*/
export async function onPreparingResponse (
  { event, response, container }: OnPreparingResponseOptions
): Promise<void> {
  const snapshot = getResponseSnapshot(event, container)

  if (isNotEmpty(snapshot.error)) {
    await prepareFallbackErrorPage(event, response, container, snapshot)
  } else if (response.isError()) {
    await prepareErrorPage(event, response, container, snapshot)
  } else if (isFunction(response.content?.module)) {
    await preparePage(event, response, container, snapshot)
  }
}
