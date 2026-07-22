import {
  Laziable,
  IBlueprint,
  isFunction,
  IContainer,
  isNotEmpty,
  isFunctionModule,
  isMetaClassModule,
  isObjectLikeModule,
  isMetaFactoryModule,
  AdapterErrorContext
} from '@stone-js/core'
import {
  IPage,
  MetaPage,
  PageType,
  PageClass,
  ISnapshot,
  IErrorPage,
  IPageLayout,
  FactoryPage,
  HeadContext,
  MetaErrorPage,
  MetaPageLayout,
  PageLayoutClass,
  StoneContextType,
  UseReactHookName,
  UseReactHookType,
  FactoryPageLayout,
  IAdapterErrorPage,
  ReactIncomingEvent,
  MetaAdapterErrorPage,
  ResponseSnapshotType,
  AdapterErrorPageClass,
  ReactOutgoingResponse,
  BrowserResponseContent,
  FactoryAdapterErrorPage,
  UseReactHookListenerContext
} from './declarations'
import { jsx } from 'react/jsx-runtime'
import { STONE_SNAPSHOT } from './constants'
import { renderSnapshotScript, composeProviders, MetaViewProvider, applyHeadToHtml, createHead } from '@stone-js/use-view'
import { ElementType, ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { StonePage } from './components/StonePage'
import { StoneError } from './components/StoneError'
import { UseReactError } from './errors/UseReactError'
import { IncomingBrowserEvent } from '@stone-js/browser-core'
import { renderWithTransition } from './dom/viewTransitions'
import { setupScrollRestoration } from './dom/scrollRestoration'
import { createRoot, hydrateRoot, Root as ReactRootInstance } from 'react-dom/client'

/**
 * Build the React application for the current route.
 * Or for the main handler if the route is not defined.
 *
 * @param event - ReactIncomingEvent
 * @param container - Service Container
 * @param component - The component response.
 * @param layout - The layout response.
 * @param data - The data to pass to the component.
 * @returns The resolved ReactNode.
 */
export const buildAppComponent = async (
  event: ReactIncomingEvent,
  container: IContainer,
  component?: ElementType,
  layout?: unknown,
  data?: any,
  statusCode?: number,
  error?: any
): Promise<ReactNode> => {
  const componentElement = await buildPageComponent(event, container, component, data, statusCode, error)
  const layoutElement = await buildLayoutComponent(container, componentElement, layout)
  const context: StoneContextType = { event, container, data }
  const children = layoutElement ?? componentElement

  const app = jsx(StonePage, { context, children })

  // Wrap the app root with any registered view providers (design-system theme providers,
  // i18n, store, …). Registered imperatively via `defineViewProvider` / declaratively via
  // `@ViewProvider`, stored under `stone.useReact.providers`. Tailwind/plain-CSS design
  // systems need none of this — they are just a stylesheet import.
  let providers: Array<MetaViewProvider<ElementType>> = []
  try {
    const registered = container.make<IBlueprint>('blueprint').get('stone.useReact.providers', [])
    providers = Array.isArray(registered) ? registered : []
  } catch {
    providers = []
  }

  if (providers.length === 0) { return app }

  return await composeProviders<ReactNode>(
    providers,
    app,
    (comp, props, ...kids) => jsx(comp as ElementType, { ...props, children: kids.length === 1 ? kids[0] : kids }),
    (provider) => (provider.isFactory === true ? (provider.module as (c: IContainer) => ElementType)(container) : provider.module),
    { context }
  )
}

/**
 * Get response layout in the current route for mutli pages application.
 * Or get it from the blueprint configuration for single page application.
 * Or get the default layout defined by the user.
 * If not defined, return undefined.
 *
 * @param container - Service Container.
 * @param children - The children to render.
 * @param layoutName - The layout name.
 * @returns The resolved layout element.
 */
export const buildLayoutComponent = async (
  container: IContainer,
  children: ReactNode,
  layoutName?: unknown
): Promise<ReactNode | undefined> => {
  const metavalue = container
    .make<IBlueprint>('blueprint')
    .get<MetaPageLayout>(
      `stone.useReact.layouts.${String(layoutName)}`
  )

  const handler = await resolveComponent<IPageLayout>(container, metavalue)
  const componentType = handler?.render.bind(handler)

  if (componentType !== undefined) {
    return jsx(componentType, { container, children, 'data-layout': layoutName })
  }
}

/**
 * Resolve the head declared by a page's layout, if any.
 *
 * A layout may expose an optional `head()` returning a {@link HeadContext} (brand-level
 * defaults: canonical social card, site name, theme color, …). It is resolved from the same
 * `stone.useReact.layouts.<name>` entry the layout component comes from, so declarative and
 * lazily code-split layouts are covered identically.
 *
 * @param container - Service Container.
 * @param layoutName - The layout name.
 * @returns The layout head context, or undefined when the layout defines none.
 */
export const resolveLayoutHead = async (
  container: IContainer,
  layoutName?: unknown
): Promise<HeadContext | undefined> => {
  const metavalue = container
    .make<IBlueprint>('blueprint')
    .get<MetaPageLayout>(`stone.useReact.layouts.${String(layoutName)}`)

  const handler = await resolveComponent<IPageLayout>(container, metavalue)

  return await handler?.head?.()
}

/**
 * Merge a layout head with a page head, the page winning on every conflict.
 *
 * The layout head is the base (brand defaults); the page head is merged on top, so same-key
 * metas/links (deduped by `property`/`name`/`rel`) and title/description from the page replace
 * the layout's. This is the hierarchical "layout head + page head" contract of {@link HeadManager}.
 *
 * @param layoutHead - The layout-provided base head (optional).
 * @param pageHead - The page-provided head (optional, wins on conflict).
 * @returns The merged head, or whichever side is defined when only one is.
 */
export const mergeHead = (
  layoutHead?: HeadContext,
  pageHead?: HeadContext
): HeadContext | undefined => {
  if (layoutHead === undefined) { return pageHead }
  if (pageHead === undefined) { return layoutHead }
  return createHead(layoutHead).merge(pageHead).toContext()
}

/**
 * Get response component in the current route.
 * If not defined, return an empty object.
 *
 * @param event - ReactIncomingEvent
 * @param container - Service Container
 * @param component - The component response.
 * @param data - The data to pass to the component.
 * @param statusCode - The status code of the error.
 * @param error - The error object.
 * @returns The resolved component element.
 */
export const buildPageComponent = (
  event: ReactIncomingEvent,
  container: IContainer,
  component?: ElementType,
  data?: any,
  statusCode?: number,
  error?: any
): ReactNode => {
  if (component !== undefined) {
    return jsx(component, { event, container, data, statusCode, error })
  }
  return jsx('div', {})
}

/**
 * Get adapter error component.
 *
 * This error handler is different from the kernel error handler.
 * Because there is no container at adapter level.
 *
 * @param blueprint - The blueprint.
 * @param context - The context of the adapter.
 * @param statusCode - The status code of the error.
 * @param error - The error object.
 * @returns The resolved layout element.
 */
export const buildAdapterErrorComponent = async <RawEventType, RawResponseType, ExecutionContextType>(
  blueprint: IBlueprint,
  context: AdapterErrorContext<RawEventType, RawResponseType, ExecutionContextType>,
  statusCode: number,
  error: any
): Promise<ReactNode | undefined> => {
  const handlerMeta = blueprint.get<MetaAdapterErrorPage<RawEventType, RawResponseType, ExecutionContextType>>(
    `stone.useReact.adapterErrorPages.${String(error?.name ?? 'default')}`
  )
  const handlerMetavalue = await resolveLazyComponent(handlerMeta)
  const layoutMetavalue = await resolveLazyComponent(blueprint.get<MetaPageLayout>(
    `stone.useReact.layouts.${String(handlerMeta?.layout)}`
  ))

  let layoutHandler: (IPageLayout | undefined)
  let handler: (IAdapterErrorPage<RawEventType, RawResponseType, ExecutionContextType> | undefined)

  if (isMetaClassModule<AdapterErrorPageClass<RawEventType, RawResponseType, ExecutionContextType>>(handlerMetavalue)) {
    handler = new handlerMetavalue.module.prototype.constructor({ blueprint })
  } else if (isMetaFactoryModule<FactoryAdapterErrorPage<RawEventType, RawResponseType, ExecutionContextType>>(handlerMetavalue)) {
    handler = handlerMetavalue.module({ blueprint })
  }

  if (isMetaClassModule<PageLayoutClass>(layoutMetavalue)) {
    layoutHandler = new layoutMetavalue.module.prototype.constructor({ blueprint })
  } else if (isMetaFactoryModule<FactoryPageLayout>(layoutMetavalue)) {
    layoutHandler = layoutMetavalue.module({ blueprint })
  }

  await handler?.handle?.(error, context)

  const componentType = handler?.render.bind(handler) as (ElementType | undefined)
  const layoutType = layoutHandler?.render.bind(layoutHandler) as (ElementType | undefined)

  if (componentType !== undefined && layoutType !== undefined) {
    const children = jsx(componentType, { blueprint, error, statusCode })
    return jsx(layoutType, { blueprint, children })
  } else if (componentType !== undefined) {
    return jsx(componentType, { blueprint, error, statusCode })
  } else {
    return jsx(StoneError, { blueprint, error, statusCode })
  }
}

/**
 * Resolve the event handler for the component.
 *
 * Can also resolve dynamically loaded components.
 *
 * @param container - The service container.
 * @param metaComponent - The meta component event handler.
 * @returns The resolved element type.
 */
export const resolveComponent = async <T = IPage<ReactIncomingEvent> | IErrorPage<ReactIncomingEvent> | IPageLayout>(
  container: IContainer,
  metaComponent?: MetaPage<ReactIncomingEvent> | MetaErrorPage<ReactIncomingEvent> | MetaPageLayout
): Promise<T | undefined> => {
  metaComponent = await resolveLazyComponent(metaComponent)

  if (isMetaClassModule<PageClass<ReactIncomingEvent>>(metaComponent)) {
    return container.resolve<IPage<ReactIncomingEvent>>(metaComponent.module) as T
  } else if (isMetaFactoryModule<FactoryPage<ReactIncomingEvent>>(metaComponent)) {
    return metaComponent.module(container) as T
  }
}

/**
 * Resolve lazy loaded components.
 *
 * @param metaComponent - The meta component event handler.
 * @returns The resolved element type.
 */
export const resolveLazyComponent = async (
  metaComponent?:
  | MetaPageLayout
  | MetaPage<ReactIncomingEvent>
  | MetaErrorPage<ReactIncomingEvent>
  | MetaAdapterErrorPage<any, any, any>
): Promise<
MetaPageLayout |
MetaPage<ReactIncomingEvent> |
MetaErrorPage<ReactIncomingEvent> |
MetaAdapterErrorPage<any, any, any> |
undefined
> => {
  if (
    metaComponent?.lazy === true &&
    isFunctionModule<Laziable<PageType<ReactIncomingEvent>>>(metaComponent?.module)
  ) {
    // Never mutate the shared (blueprint-owned, process-wide) meta object, and never
    // expose `lazy: false` before the import settles: doing so created a race where a
    // concurrent SSR request saw `lazy: false` with `module` still the import factory.
    // Resolve once (memoized across requests), then return a fresh, fully-resolved meta.
    let resolved = lazyModuleCache.get(metaComponent)
    if (resolved === undefined) {
      resolved = await metaComponent.module()
      lazyModuleCache.set(metaComponent, resolved)
    }
    return { ...metaComponent, lazy: false, module: resolved }
  }

  return metaComponent
}

/**
 * Cache of resolved lazy modules, keyed by their (shared) meta object. Lets a lazily
 * imported component be resolved once per process without mutating the shared meta.
 */
const lazyModuleCache = new WeakMap<object, PageType<ReactIncomingEvent>>()

/**
 * Get the root element to render the React components.
 *
 * @param blueprint - The blueprint.
 * @returns The root element to render the React components.
 * @throws {UseReactError} If the root container is not found.
 */
export const getAppRootElement = (blueprint: IBlueprint): HTMLElement => {
  const rootElementId = blueprint.get<string>('stone.useReact.rootElementId', 'root')
  const appContainer = document.getElementById(rootElementId) ?? undefined
  if (appContainer === undefined) { throw new UseReactError('Root container is required to render React components.') }
  return appContainer
}

/**
 * Renders the React app.
 *
 * @param app - The React app to render.
 * @param blueprint - The blueprint.
 * @returns The React root instance.
 */
export const renderReactApp = (app: ReactNode, blueprint: IBlueprint): ReactRootInstance => {
  const existing = blueprint.get<ReactRootInstance>('stone.useReact.reactRoot')
  const reactRoot = existing ?? createRoot(getAppRootElement(blueprint))

  // A re-render (root already existed) is a client navigation → eligible for a View Transition.
  renderWithTransition(reactRoot, app, {
    enabled: blueprint.get<boolean>('stone.useReact.viewTransitions', true),
    isNavigation: existing !== undefined
  })

  blueprint.setIf('stone.useReact.reactRoot', reactRoot)
  ensureScrollRestoration(blueprint)

  return reactRoot
}

/**
 * Installs SPA scroll restoration once per app (idempotent via a blueprint flag).
 *
 * @param blueprint - The blueprint.
 */
const ensureScrollRestoration = (blueprint: IBlueprint): void => {
  if (blueprint.get<boolean>('stone.useReact.scrollRestorationReady', false)) { return }
  setupScrollRestoration({ enabled: blueprint.get<boolean>('stone.useReact.scrollRestoration', true) })
  blueprint.setIf('stone.useReact.scrollRestorationReady', true)
}

/**
 * Hydrates the React app when SSR is enabled.
 *
 * @param app - The React app to hydrate.
 * @param blueprint - The blueprint.
 * @returns The React root instance.
 */
export const hydrateReactApp = (app: ReactNode, blueprint: IBlueprint): ReactRootInstance => {
  const reactRoot = hydrateRoot(getAppRootElement(blueprint), app)
  blueprint.setIf('stone.useReact.reactRoot', reactRoot)
  ensureScrollRestoration(blueprint)

  return reactRoot
}

/**
 * Check if the current environment is the server.
 *
 * @returns True if the current environment is the server.
 */
export const isServer = (): boolean => typeof window === 'undefined'

/**
 * Check if the current environment is the client.
 *
 * @returns True if the current environment is the client.
 */
export const isClient = (): boolean => !isServer()

/**
 * Get the HTML template for the React application.
 *
 * @param blueprint - The blueprint.
 * @returns The HTML template.
 */
export const htmlTemplate = (
  blueprint: IBlueprint
): string => {
  const content = blueprint.get<string>('stone.useReact.htmlTemplateContent')
  if (isNotEmpty<string>(content)) {
    return content
  } throw new UseReactError(
    'HTML template content is required for server-side rendering. Please provide the `htmlTemplateContent` in the blueprint configuration.'
  )
}

/**
 * Determine if the application is running on the server side.
 *
 * @returns True if the application is running on the server side, false otherwise.
 */
export function isSSR (): boolean {
  return typeof window === 'undefined'
}

/**
 * Execute the handler.
 *
 * This method will try to get data from the snapshot
 * If the snapshot is not present, it will execute the handler.
 * If the handler is not present, it will return undefined.
 *
 * @param response - The response object.
 * @returns The data from the response.
 */
export async function executeHandler (
  event: IncomingBrowserEvent,
  response: ReactOutgoingResponse,
  snapshot: ResponseSnapshotType,
  handler?: (IPage<IncomingBrowserEvent> | IErrorPage<IncomingBrowserEvent>),
  error?: any
): Promise<any> {
  let result: any = snapshot

  if (!snapshot.ssr) {
    if (isNotEmpty<Error>(error) && isObjectLikeModule<IErrorPage<IncomingBrowserEvent>>(handler)) {
      result = await handler.handle?.(error, event)
    } else if (isObjectLikeModule<IPage<IncomingBrowserEvent>>(handler)) {
      result = await handler.handle?.(event)
    } else {
      result = undefined
    }
  }

  if (isNotEmpty(result?.statusCode)) {
    response.setStatus(result.statusCode)
  }

  if (
    isNotEmpty(result?.headers) &&
    isNotEmpty<{ setHeaders: Function }>(response) &&
    isFunction(response.setHeaders)
  ) {
    response.setHeaders(result.headers)
  }

  return result?.content ?? result?.data ?? result
}

/**
 * Keep track of the current layout.
 * This is used to determine if the layout has changed.
 * We make a full render each time the layout changes.
 *
 * @returns The current layout.
 */
let currentLayout: string | undefined

/**
 * Get the browser content.
 *
 * @param app - The app component to render.
 * @param component - The component to render.
 * @param layout - The layout to use.
 * @param snapshot - The response snapshot.
 * @param head - The head context.
 * @returns The browser response content.
 */
export function getBrowserContent (
  app: ReactNode,
  component: ReactNode,
  layout: any,
  snapshot: ResponseSnapshotType,
  head?: HeadContext
): BrowserResponseContent {
  const content = { head, app, component, fullRender: currentLayout !== layout, ssr: snapshot.ssr }
  currentLayout = layout
  return content
}

/**
 * Get the server content.
 *
 * @param component - The React component to hydrate.
 * @param data - The data to pass to the components.
 * @param container - The service container.
 * @param event - The incoming browser event.
 * @param head - The head context.
 * @returns The server response content as a string.
 */
export function getServerContent (
  component: ReactNode,
  data: Partial<ResponseSnapshotType>,
  container: IContainer,
  event: IncomingBrowserEvent,
  head?: HeadContext
): string {
  const html = renderToString(component).concat('\n<!--app-html-->')
  const template = htmlTemplate(container.make<IBlueprint>('blueprint'))
  const snapshot = snapshotResponse(event, container, data).concat('\n<!--app-head-->')

  // Function replacers: rendered HTML / snapshot may contain `$&`, `$'`, `$1`… which
  // String.replace would otherwise interpret as replacement patterns and corrupt the output.
  return applyHeadToHtml(head ?? {}, template)
    .replace('<!--app-html-->', () => html)
    .replace('<!--app-head-->', () => snapshot)
}

/**
 * Get the response snapshot.
 *
 * @param event - The incoming browser event.
 * @returns The response snapshot.
 */
export function getResponseSnapshot (event: IncomingBrowserEvent, container: IContainer): ResponseSnapshotType {
  return container.make<ISnapshot>('snapshot').get(event.fingerprint(), { ssr: false })
}

/**
 * Snapshot the response data.
 *
 * @param event - The incoming HTTP event.
 * @param data - The data to snapshot.
 */
export function snapshotResponse (event: IncomingBrowserEvent, container: IContainer, data: Partial<ResponseSnapshotType>): string {
  const snapshot = container.make<ISnapshot>('snapshot')
  return renderStoneSnapshot(snapshot.add(event.fingerprint(), { ...data, ssr: true }).toJson())
}

/**
 * Render Stone snapshot into an inline script tag.
 *
 * Delegates to `@stone-js/use-view`'s XSS-safe serializer: the snapshot JSON is escaped
 * (`< > &`, U+2028/U+2029) so user-controlled data returned by a page `handle()` cannot
 * break out of the `<script>` tag. The payload stays valid JSON for the client parser.
 *
 * @param snapshot - The snapshot JSON to render.
 * @returns The script tag.
 */
export function renderStoneSnapshot (snapshot: string): string {
  return renderSnapshotScript(snapshot, STONE_SNAPSHOT)
}

/**
 * Execute hooks.
 *
 * @param name - The name of the hook.
 * @param context - The context of the adapter.
 */
export async function executeHooks (name: UseReactHookName, context: UseReactHookListenerContext): Promise<void> {
  const hooks = context.container.make<IBlueprint>('blueprint').get<UseReactHookType>('stone.lifecycleHooks', {})

  if (Array.isArray(hooks[name])) {
    for (const listener of hooks[name]) {
      await listener(context)
    }
  }
}
