/**
 * Framework-agnostic view-engine contracts shared by every Stone.js view integration
 * (use-react today, use-vue tomorrow). Nothing here imports React or the DOM: a concrete
 * engine supplies the node type `VNode` and a `ViewRoot` handle.
 */

/**
 * Supported rendering modes.
 *
 * - `csr` : client-side rendering only (SPA).
 * - `ssr` : server-side rendering with client hydration.
 * - `ssg` : static site generation (pre-rendered at build time, hydrated on the client).
 */
export type RenderingMode = 'csr' | 'ssr' | 'ssg'

/**
 * A single head descriptor (meta/link/script/style entry).
 */
export interface HeadEntry extends Record<string, unknown> {}

/**
 * A meta descriptor: either a named (`name`) or property (`property`) meta with content.
 * Structurally compatible with `@stone-js/router`'s `HTMLMetaDescriptor`.
 */
export interface MetaDescriptor {
  name?: string
  property?: string
  content: string
  [attr: string]: unknown
}

/**
 * A link descriptor (`rel` + `href`, plus arbitrary attributes).
 */
export interface LinkDescriptor {
  rel: string
  href: string
  [attr: string]: unknown
}

/**
 * A script descriptor. `src` for external scripts, or `content` for inline scripts
 * (e.g. JSON-LD structured data with `type: 'application/ld+json'`).
 */
export interface ScriptDescriptor {
  src?: string
  content?: string
  type?: string
  async?: boolean
  defer?: boolean
  [attr: string]: unknown
}

/**
 * A style descriptor (inline CSS).
 */
export interface StyleDescriptor {
  content: string
  [attr: string]: unknown
}

/**
 * Framework-agnostic head context produced by a page's `head()`.
 *
 * Richer than a bare title/meta list: supports a title template, `<base>`, HTML/body
 * attributes, and JSON-LD structured data. The {@link HeadManager} builder produces this
 * shape; {@link serializeHead} renders it for SSR/SSG and view engines apply it in the DOM.
 */
export interface HeadContext {
  title?: string
  /** Template applied to `title`, e.g. `'%s — Stone.js'` (`%s` is the page title). */
  titleTemplate?: string
  description?: string
  base?: { href?: string, target?: string }
  metas?: MetaDescriptor[]
  links?: LinkDescriptor[]
  scripts?: ScriptDescriptor[]
  styles?: StyleDescriptor[]
  /** JSON-LD structured-data objects, rendered as `<script type="application/ld+json">`. */
  jsonLd?: Array<Record<string, unknown>>
  /** Attributes to set on the `<html>` element (e.g. `{ lang: 'en' }`). */
  htmlAttributes?: Record<string, string>
  /** Attributes to set on the `<body>` element. */
  bodyAttributes?: Record<string, string>
}

/**
 * Context passed to a page's render/head phase.
 *
 * @template DataType - The shape returned by the page's `handle()` (its loader).
 */
export interface ViewRenderContext<DataType = unknown> {
  data?: DataType
  error?: unknown
  statusCode?: number
  [key: string]: unknown
}

/**
 * A view page: a loader (`handle`), an optional head, and a render function.
 *
 * This mirrors the React `IPage` but keeps the node type generic so the same contract
 * describes a Vue component, a string template, or any other engine's output.
 *
 * @template DataType - Data returned by `handle()`.
 * @template VNode - The engine's node type (JSX element, VNode, …).
 * @template EventType - The incoming event type.
 */
export interface IView<DataType = unknown, VNode = unknown, EventType = unknown> {
  handle?: (event: EventType) => DataType | Promise<DataType>
  head?: (context: ViewRenderContext<DataType>) => HeadContext | Promise<HeadContext>
  render: (context: ViewRenderContext<DataType>) => VNode
}

/**
 * A view root handle returned by mount/hydrate, used to update or unmount later.
 */
export interface ViewRoot {
  update?: (node: unknown) => void
  unmount?: () => void
}

/**
 * The contract each concrete engine (React, Vue, …) implements. `use-view` orchestration
 * calls only through this interface, so nothing engine-specific leaks into the shared layer.
 *
 * @template VNode - The engine's node type.
 * @template Root - The engine's root handle (defaults to {@link ViewRoot}).
 */
export interface ViewEngine<VNode = unknown, Root extends ViewRoot = ViewRoot> {
  /** Create an element/vnode from a component and props. */
  createElement: (component: unknown, props?: Record<string, unknown> | null, ...children: VNode[]) => VNode
  /** Render a node to an HTML string (SSR/SSG, buffered). May be sync or async. */
  renderToString: (node: VNode) => string | Promise<string>
  /**
   * Render a node to a stream (streaming SSR). Optional: engines that support it (React 19
   * renderToPipeableStream / renderToReadableStream) implement it; the renderer falls back
   * to `renderToString` when absent. Returns a Web `ReadableStream` for runtime-agnostic
   * piping (Node, edge/WinterCG).
   */
  renderToStream?: (node: VNode, options?: StreamRenderOptions) => Promise<ReadableStream<Uint8Array>>
  /** Mount a node into a container (client, fresh render). May be async (lazy client runtime). */
  mount: (node: VNode, container: Element) => Root | Promise<Root>
  /** Hydrate server-rendered markup in a container (client, after SSR/SSG). May be async. */
  hydrate: (node: VNode, container: Element) => Root | Promise<Root>
  /** Wrap the application tree with the engine's context/providers. */
  wrapApp?: (node: VNode, context: unknown) => VNode
}

/**
 * Options for streaming render.
 */
export interface StreamRenderOptions {
  /** Markup injected into the stream head (before the app shell), e.g. the serialized head. */
  head?: string
  /** Markup appended after the app shell (e.g. the hydration snapshot script). */
  tail?: string
  /** Bootstrap module scripts to start hydration on the client. */
  bootstrapModules?: string[]
  /** Nonce for CSP. */
  nonce?: string
  /** Abort signal to cancel the stream. */
  signal?: AbortSignal
  /** Called when the shell is ready (before streaming Suspense content). */
  onShellReady?: () => void
  /** Called if the shell errored. */
  onShellError?: (error: unknown) => void
}

/**
 * A single unit of work for static generation: a route to pre-render at build time.
 *
 * @template ParamsType - The route params for a parameterized route.
 */
export interface PrerenderTarget<ParamsType = Record<string, string>> {
  /** The URL path to render (e.g. `/blog/hello-world`). */
  path: string
  /** Route params (for parameterized routes). */
  params?: ParamsType
}

/**
 * The output of pre-rendering a single {@link PrerenderTarget}.
 */
export interface PrerenderResult {
  /** The target path. */
  path: string
  /** The full HTML document to write (e.g. to `dist/<path>/index.html`). */
  html: string
  /** The serialized head (already included in `html`; exposed for tooling). */
  head?: string
  /** The status code the page resolved to (200, 404, …). */
  statusCode: number
}

/**
 * Contract for the SSG orchestrator (implemented by the CLI): given the list of targets
 * and a per-target renderer, produce the pre-rendered results. Kept here so the view layer
 * and the build tool agree on the shape.
 *
 * @template EventType - The incoming event type.
 */
export interface PrerenderContract<EventType = unknown> {
  /** Discover the routes to pre-render (static routes + expanded parameterized routes). */
  collectTargets: () => Promise<PrerenderTarget[]> | PrerenderTarget[]
  /** Render one target to HTML (reuses the SSR path with a synthetic event). */
  renderTarget: (target: PrerenderTarget, event: EventType) => Promise<PrerenderResult>
}

/**
 * A meta module descriptor for a view (page/layout/error page), shared with the router
 * and the build-time manifest. When `lazy` is true, `module` is an async import factory.
 *
 * @template T - The concrete module type (component, class, factory).
 */
export interface MetaView<T = unknown> {
  module: T | (() => Promise<{ default?: T } & Record<string, T>>)
  isClass?: boolean
  isFactory?: boolean
  isComponent?: boolean
  lazy?: boolean
  layout?: string
  [key: string]: unknown
}

/**
 * A value that may be provided lazily as an async import factory.
 */
export type Laziable<T> = T | (() => Promise<T>)
