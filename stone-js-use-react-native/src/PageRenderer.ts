import { NativeResponseContent } from './declarations'
import { IContainer } from '@stone-js/core'
import { IncomingBrowserEvent } from '@stone-js/browser-core'
import {
  PreparedPage,
  preparePageParts,
  ReactOutgoingResponse,
  ResponseSnapshotType,
  prepareErrorPageParts,
  applyFallbackErrorContent
} from '@stone-js/use-react-core'

/**
 * Resolve a route into something the navigation stack can display.
 *
 * The resolving is not here: it is `@stone-js/use-react-core`, unchanged, and the same code the
 * web renderer calls. Which component answers, what its loader returns, how the layout wraps it
 * and how the head merges are the same questions with the same answers on both platforms, and a
 * page written for one needs no native variant of its logic.
 *
 * What is here is the one line that differs. There is no HTML document to assemble and no markup
 * to hydrate, so the resolved tree becomes native content, and a middleware puts it on the stack.
 *
 * @param event - The incoming navigation event.
 * @param response - The outgoing response.
 * @param container - The service container.
 * @param snapshot - The response snapshot.
 */
export async function preparePage (
  event: IncomingBrowserEvent,
  response: ReactOutgoingResponse,
  container: IContainer,
  snapshot: ResponseSnapshotType
): Promise<void> {
  response.setContent(toNativeContent(await preparePageParts(event, response, container, snapshot), event))
}

/**
 * Resolve a declared error page into something the stack can display.
 *
 * No fallback component is passed: the web renderer hands its HTML error page here, and this one
 * has none to give. A native application shows what it declared, or nothing.
 *
 * @param event - The incoming navigation event.
 * @param response - The outgoing response.
 * @param container - The service container.
 * @param snapshot - The response snapshot.
 */
export async function prepareErrorPage (
  event: IncomingBrowserEvent,
  response: ReactOutgoingResponse,
  container: IContainer,
  snapshot: ResponseSnapshotType
): Promise<void> {
  response.setContent(toNativeContent(await prepareErrorPageParts(event, response, container, snapshot), event))
}

/**
 * Resolve an error that happened before any page could answer.
 *
 * @param event - The incoming navigation event.
 * @param response - The outgoing response.
 * @param container - The service container.
 * @param snapshot - The response snapshot.
 */
export async function prepareFallbackErrorPage (
  event: IncomingBrowserEvent,
  response: ReactOutgoingResponse,
  container: IContainer,
  snapshot: ResponseSnapshotType
): Promise<void> {
  applyFallbackErrorContent(response, container, snapshot)

  await prepareErrorPage(event, response, container, snapshot)
}

/**
 * Turn the prepared pieces into native content.
 *
 * The path travels with the content so a navigator can key its screens by route rather than by
 * position, which is what lets a screen keep its state while another covers it.
 *
 * @param parts - The prepared page.
 * @param event - The event being answered.
 * @returns The native content.
 */
function toNativeContent (parts: PreparedPage, event: IncomingBrowserEvent): NativeResponseContent {
  return {
    app: parts.app,
    head: parts.head,
    layout: parts.layout,
    path: event.pathname,
    component: parts.component
  }
}
