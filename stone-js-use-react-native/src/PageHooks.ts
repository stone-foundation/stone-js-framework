import { IncomingBrowserEvent } from '@stone-js/browser-core'
import { IContainer, isFunction, isNotEmpty } from '@stone-js/core'
import { prepareFallbackErrorPage, prepareErrorPage, preparePage } from './PageRenderer'
import { ReactOutgoingResponse, getResponseSnapshot } from '@stone-js/use-react-core'

/**
 * Options for the onPreparingResponse hook.
 */
export interface OnPreparingResponseOptions {
  container: IContainer
  event: IncomingBrowserEvent
  response: ReactOutgoingResponse
}

/**
 * Turn whatever the kernel produced into something displayable, just before it leaves.
 *
 * Three cases, in the order they must be checked: an error carried on the snapshot (nothing
 * ever got to answer), a response that is itself an error, and a normal page. A response
 * that is none of those is left alone, which is how a handler returning plain data still
 * works on a phone.
 *
 * @param context - The hook context.
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
