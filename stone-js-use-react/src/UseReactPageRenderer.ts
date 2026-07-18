import { StoneError } from './components/StoneError'
import { IContainer, IBlueprint } from '@stone-js/core'
import { IncomingBrowserEvent } from '@stone-js/browser-core'
import { ReactOutgoingResponse, ResponseSnapshotType, IPage, ReactIncomingEvent, IErrorPage, MetaErrorPage } from './declarations'
import { resolveComponent, executeHandler, executeHooks, buildPageComponent, buildAppComponent, isSSR, getServerContent, getBrowserContent } from './UseReactPageInternals'

/**
 * Prepare the page to render.
 *
 * Here we prepare the page to render by resolving
 * the handler, handler the event, and rendering the component.
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
  const { layout = 'default' } = response.content
  const page = await resolveComponent<IPage<ReactIncomingEvent>>(container, response.content)
  const data = await executeHandler(event, response, snapshot, page)
  const componentType = page?.render.bind(page)
  const head = await page?.head?.({ event, data, statusCode: response.statusCode })

  await executeHooks('onPreparingPage', { event, response, container, snapshot, data, componentType, head })

  const snapshotData = { data, layout, statusCode: response.statusCode }
  const component = await buildPageComponent(event, container, componentType, data, response.statusCode)
  const appComponent = await buildAppComponent(event, container, componentType, layout, data, response.statusCode)

  response.setContent(isSSR()
    ? getServerContent(appComponent, snapshotData, container, event, head)
    : getBrowserContent(appComponent, component, layout, snapshot, head)
  )
}

/**
 * Prepare the error page to render.
 *
 * Error pages are prepared sepatately because their handler
 * is different from the normal page handler.
 * Their handler takes an error as the first argument and the event as the second.
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
  const { error = {}, layout } = response.content
  const errorPage = await resolveComponent<IErrorPage<ReactIncomingEvent>>(container, response.content)
  const data = await executeHandler(event, response, snapshot, errorPage, error)
  const componentType = errorPage?.render.bind(errorPage) ?? StoneError
  const head = await errorPage?.head?.({ event, data, statusCode: response.statusCode, error })

  await executeHooks('onPreparingPage', { event, response, container, snapshot, data, componentType, head, error })

  const snapshotData = { data, layout, statusCode: response.statusCode, error: { name: error.name } }
  const component = await buildPageComponent(event, container, componentType, data, response.statusCode, error)
  const appComponent = await buildAppComponent(event, container, componentType, layout, data, response.statusCode, error)

  response.setContent(isSSR()
    ? getServerContent(appComponent, snapshotData, container, event, head)
    : getBrowserContent(appComponent, component, layout, snapshot, head)
  )
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

  await prepareErrorPage(event, response, container, snapshot)
}
