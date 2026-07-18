import { ReactNode } from 'react'
import { ReactViewEngine } from './ReactViewEngine'
import { HeadContext, PrerenderResult, renderSnapshotScript, applyHeadToHtml } from '@stone-js/use-view'

/**
 * Static generation (SSG) render step for React.
 *
 * SSG is SSR executed at build time: for each route the CLI produces a synthetic event,
 * runs the page, and calls this to assemble the final HTML document (identical output to
 * the SSR path, so pages behave the same whether pre-rendered or server-rendered). The CLI
 * owns the orchestration (route discovery, writing `dist/<path>/index.html`) via the
 * `PrerenderContract` from `@stone-js/use-view`; this is the per-page renderer it calls.
 */

/**
 * Options for {@link prerenderPage}.
 */
export interface PrerenderPageOptions {
  /** The route path being generated (e.g. `/blog/hello-world`). */
  path: string
  /** The fully-built React tree for the page (layout + page + providers). */
  node: ReactNode
  /** The HTML template containing `<!--app-html-->` and `<!--app-head-->` placeholders. */
  template: string
  /** The page's resolved head context. */
  head?: HeadContext
  /** The hydration snapshot to embed (defaults to `{ ssr: true }`). */
  snapshot?: Record<string, unknown>
  /** The resolved status code (defaults to 200). */
  statusCode?: number
}

/**
 * Pre-render a single page to a full HTML document.
 *
 * @param options - The prerender options.
 * @returns A {@link PrerenderResult} the CLI can write to disk.
 */
export async function prerenderPage (options: PrerenderPageOptions): Promise<PrerenderResult> {
  const appHtml = await ReactViewEngine.renderToString(options.node)

  // Same assembly as the SSR path (function replacers guard against `$&`/`$'` in content).
  let html = applyHeadToHtml(options.head ?? {}, options.template)
  html = html.replace('<!--app-html-->', () => appHtml)
  const snapshotScript = renderSnapshotScript(options.snapshot ?? { ssr: true })
  html = html.replace('<!--app-head-->', () => snapshotScript)

  return {
    path: options.path,
    html,
    statusCode: options.statusCode ?? 200
  }
}
