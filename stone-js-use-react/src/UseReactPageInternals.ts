import {
  IContainer,
  IBlueprint,
  isNotEmpty
} from '@stone-js/core'
import { ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { IncomingBrowserEvent } from '@stone-js/browser-core'
import { renderWithTransition } from './dom/viewTransitions'
import { applyHeadToHtml, renderSnapshotScript } from '@stone-js/use-view'
import { setupScrollRestoration } from './dom/scrollRestoration'
import { createRoot, hydrateRoot, Root as ReactRootInstance } from 'react-dom/client'
import {
  ISnapshot,
  HeadContext,
  UseReactError,
  STONE_SNAPSHOT,
  ResponseSnapshotType,
  BrowserResponseContent
} from '@stone-js/use-react-core'

/**
 * The web half of the page pipeline: everything that needs a document.
 *
 * Mounting a root, hydrating server markup, the HTML shell and the snapshot script tag are
 * all specific to a browser and to `react-dom`, so they stay here. The platform-independent
 * half lives in `@stone-js/use-react-core` and is re-exported below, because nine modules
 * (and the CLI) import those symbols from this path.
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

/** Whether the missing-template warning has already been given, so it is said once, not per request. */
let templateFallbackWarned = false

/**
 * The smallest document this renderer can render into.
 *
 * Server rendering needs a shell carrying the two placeholders it splices into, the element the client
 * hydrates, and a `<title>` — a page's title is *replaced* in place rather than inserted, so a shell
 * without one silently loses it. The real shell is generated from the project's `index.html` at build
 * time and carries the stylesheet and the client bundle; this one carries nothing but the contract.
 *
 * It exists because there is a legitimate context with no build step: a test. Booting an application
 * in memory and rendering a page is exactly what `@stone-js/testing` does, and refusing to render
 * there served nobody — the shell is the renderer's own business, so the renderer can produce it.
 *
 * @param rootElementId - The element the client mounts on.
 * @returns The minimal HTML template.
 */
export const defaultHtmlTemplate = (rootElementId: string = 'root'): string => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title></title>
    <!--app-head-->
  </head>
  <body>
    <div id="${rootElementId}"><!--app-html--></div>
  </body>
</html>
`

/**
 * Get the HTML template for the React application.
 *
 * Falls back to {@link defaultHtmlTemplate} when none is configured, warning once. A build always
 * sets one, so reaching the fallback means either a test (where it is the point) or a build that did
 * not run (where an unstyled page plus one warning beats a page that cannot render at all).
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
  }

  if (!templateFallbackWarned) {
    templateFallbackWarned = true
    console.warn(
      '[@stone-js/use-react] No `stone.useReact.htmlTemplateContent` was configured, rendering into a ' +
      'minimal HTML shell. Expected outside a build (a test, for instance); inside one, it means the ' +
      'template was not generated and the page will ship without its stylesheet or client bundle.'
    )
  }

  return defaultHtmlTemplate(blueprint.get<string>('stone.useReact.rootElementId', 'root'))
}

/**
 * Determine if the application is running on the server side.
 *
 * @returns True if the application is running on the server side, false otherwise.
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
