import { ElementType, ReactNode } from 'react'
import { IBlueprint, IContainer } from '@stone-js/core'
import { mergeHead, resolveLayoutHead, resolveComponent, executeHandler, executeHooks, buildPageComponent, buildAppComponent } from './PageInternals'
import {
  IPage,
  IErrorPage,
  HeadContext,
  MetaErrorPage,
  ReactIncomingEvent,
  ResponseSnapshotType,
  ReactOutgoingResponse
} from './declarations'

/**
 * Everything a renderer needs to display one resolved route.
 *
 * Two shapes come out of the same work: the page wrapped in its layout and providers, and the
 * page alone for a renderer that supplies its own chrome. Which one is used, and what is done
 * with it, is the renderer's business.
 */
export interface PreparedPage {
  /** The page's loader result. */
  data: any

  /** The layout the page asked for. */
  layout?: string

  /** The merged head, layout first, page last. */
  head?: HeadContext

  /** The page alone. */
  component: ReactNode

  /** The page wrapped in its layout and view providers. */
  app: ReactNode

  /** What a hydrating renderer serializes: the pieces a second render needs. */
  snapshotData: Record<string, unknown>
}

/**
 * Resolve a route into the pieces a renderer displays.
 *
 * This is the whole page pipeline, and it is the same on every platform: resolve the component
 * the route names, run its loader, merge the layout's head with the page's, let the view hooks
 * run, then build the two component shapes. Nothing here decides where the result goes.
 *
 * It lives in this package rather than in each renderer because there is exactly one correct
 * order for these steps, and having it written twice would mean every change to it having to be
 * made twice, in two packages, correctly.
 *
 * @param event - The incoming event.
 * @param response - The outgoing response.
 * @param container - The service container.
 * @param snapshot - The response snapshot.
 * @returns The pieces to display.
 */
export async function preparePageParts (
  event: ReactIncomingEvent,
  response: ReactOutgoingResponse,
  container: IContainer,
  snapshot: ResponseSnapshotType
): Promise<PreparedPage> {
  const { layout = 'default' } = response.content
  const page = await resolveComponent<IPage<ReactIncomingEvent>>(container, response.content)
  const data = await executeHandler(event as any, response, snapshot, page)
  const componentType = page?.render.bind(page) as (ElementType | undefined)
  const pageHead = await page?.head?.({ event, data, statusCode: response.statusCode })
  const layoutHead = await resolveLayoutHead(container, layout)
  const head = mergeHead(layoutHead, pageHead)

  await executeHooks('onPreparingPage', { event, response, container, snapshot, data, componentType, head })

  return {
    data,
    head,
    layout,
    snapshotData: { data, layout, statusCode: response.statusCode },
    component: await buildPageComponent(event, container, componentType, data, response.statusCode),
    app: await buildAppComponent(event, container, componentType, layout, data, response.statusCode)
  }
}

/**
 * Resolve a declared error page into the pieces a renderer displays.
 *
 * Separate from {@link preparePageParts} for one reason: an error page's loader takes the error
 * first and the event second, so it cannot share the call.
 *
 * @param event - The incoming event.
 * @param response - The outgoing response.
 * @param container - The service container.
 * @param snapshot - The response snapshot.
 * @param fallback - Rendered when the application declared no component for this error. A web
 * renderer passes its HTML error page; a native one passes nothing, because a package that may
 * be rendering native views cannot reach for HTML.
 * @returns The pieces to display.
 */
export async function prepareErrorPageParts (
  event: ReactIncomingEvent,
  response: ReactOutgoingResponse,
  container: IContainer,
  snapshot: ResponseSnapshotType,
  fallback?: ElementType
): Promise<PreparedPage> {
  const { error = {}, layout } = response.content
  const errorPage = await resolveComponent<IErrorPage<ReactIncomingEvent>>(container, response.content)
  const data = await executeHandler(event as any, response, snapshot, errorPage, error)
  const componentType = (errorPage?.render.bind(errorPage) ?? fallback) as (ElementType | undefined)
  const pageHead = await errorPage?.head?.({ event, data, statusCode: response.statusCode, error })
  const layoutHead = await resolveLayoutHead(container, layout)
  const head = mergeHead(layoutHead, pageHead)

  await executeHooks('onPreparingPage', { event, response, container, snapshot, data, componentType, head, error })

  return {
    data,
    head,
    layout,
    snapshotData: { data, layout, statusCode: response.statusCode, error: { name: error.name } },
    component: await buildPageComponent(event, container, componentType, data, response.statusCode, error),
    app: await buildAppComponent(event, container, componentType, layout, data, response.statusCode, error)
  }
}

/**
 * Put the declared error page on the response, for an error nothing ever answered.
 *
 * The error is carried on the snapshot rather than by a page, because the failure happened
 * before any page could run. The renderer then prepares it like any other error page.
 *
 * @param response - The outgoing response.
 * @param container - The service container.
 * @param snapshot - The response snapshot.
 */
export function applyFallbackErrorContent (
  response: ReactOutgoingResponse,
  container: IContainer,
  snapshot: ResponseSnapshotType
): void {
  const { layout, error, statusCode = 500 } = snapshot
  const blueprint = container.make<IBlueprint>('blueprint')
  const metavalue = blueprint.get<MetaErrorPage<ReactIncomingEvent>>(
    `stone.useReact.errorPages.${String(error?.name)}`,
    blueprint.get<MetaErrorPage<ReactIncomingEvent>>(
      'stone.useReact.errorPages.default',
      {} as any
    )
  )
  const content = { ...metavalue, layout }

  content.error = error ?? (response.content instanceof Error ? response.content : new Error('An error occurred.'))

  response
    .setContent(content)
    .setStatus(statusCode)
}
