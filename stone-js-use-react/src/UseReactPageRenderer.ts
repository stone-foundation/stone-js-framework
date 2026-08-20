import { IContainer } from '@stone-js/core'
import { StoneError } from './components/StoneError'
import { IncomingBrowserEvent } from '@stone-js/browser-core'
import { getServerContent, getBrowserContent } from './UseReactPageInternals'
import {
  PreparedPage,
  preparePageParts,
  ReactOutgoingResponse,
  ResponseSnapshotType,
  prepareErrorPageParts,
  applyFallbackErrorContent,
  isSSR
} from '@stone-js/use-react-core'

/**
 * Prepare the page to render.
 *
 * Resolving the route into displayable pieces is `@stone-js/use-react-core`'s work, shared with
 * the native renderer: the same component resolution, the same loader, the same layout wrapping,
 * the same head merge, the same view hooks. What is web-specific is what happens to the result,
 * which is the last line: a full HTML document on the server, or content for the live one.
 *
 * @param event - The incoming HTTP event.
 * @param response - The outgoing HTTP response.
 * @param container - The service container.
 * @param snapshot - The response snapshot.
 */
export async function preparePage (
  event: IncomingBrowserEvent,
  response: ReactOutgoingResponse,
  container: IContainer,
  snapshot: ResponseSnapshotType
): Promise<void> {
  const parts = await preparePageParts(event, response, container, snapshot)

  response.setContent(toWebContent(parts, container, event, snapshot))
}

/**
 * Prepare the error page to render.
 *
 * Error pages are prepared separately because their handler is different from the normal page
 * handler: it takes an error as the first argument and the event as the second. `StoneError` is
 * handed over as the fallback, for an error the application declared no page for.
 *
 * @param event - The incoming HTTP event.
 * @param response - The outgoing HTTP response.
 * @param container - The service container.
 * @param snapshot - The response snapshot.
 */
export async function prepareErrorPage (
  event: IncomingBrowserEvent,
  response: ReactOutgoingResponse,
  container: IContainer,
  snapshot: ResponseSnapshotType
): Promise<void> {
  const parts = await prepareErrorPageParts(event, response, container, snapshot, StoneError)

  response.setContent(toWebContent(parts, container, event, snapshot))
}

/**
 * Prepare the fallback error page to render.
 *
 * We prepare a fallback error page if no event nor error handler is provided.
 *
 * @param event - The incoming event.
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
 * Turn the prepared pieces into browser or server content.
 *
 * @param parts - The prepared page.
 * @param container - The service container.
 * @param event - The event being answered.
 * @param snapshot - The response snapshot.
 * @returns The content to set on the response.
 */
function toWebContent (
  parts: PreparedPage,
  container: IContainer,
  event: IncomingBrowserEvent,
  snapshot: ResponseSnapshotType
): unknown {
  return isSSR()
    ? getServerContent(parts.app, parts.snapshotData as any, container, event, parts.head)
    : getBrowserContent(parts.app, parts.component, parts.layout, snapshot, parts.head)
}
