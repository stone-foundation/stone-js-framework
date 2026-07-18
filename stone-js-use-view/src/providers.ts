/**
 * View provider registry — the mechanism that lets any design system or context provider
 * wrap the application root without touching framework internals.
 *
 * A "view provider" is any component that should wrap the whole app tree: a design-system
 * theme provider (MUI, Chakra, NoowowDesign…), an i18n provider, a store provider, etc.
 * Tailwind and plain-CSS design systems need no provider at all — they are just a stylesheet
 * import — so this registry is only for providers that must be present in the React/Vue tree.
 *
 * Providers compose outermost-first by ascending `priority` (lower = outer):
 * `P(1) > P(2) > ...> app`.
 *
 * ```ts
 * // imperative
 * defineViewProvider(ThemeProvider, { priority: 10 })
 * // then the renderer wraps: <ThemeProvider><App/></ThemeProvider>
 * ```
 */

/**
 * A registered view provider descriptor.
 *
 * @template T - The provider component/module type.
 */
export interface MetaViewProvider<T = unknown> {
  readonly __viewProvider: true
  module: T
  isClass?: boolean
  isFactory?: boolean
  /** Extra props passed to the provider element. */
  props?: Record<string, unknown>
  /** Composition order; lower wraps the outer layer. Default 10. */
  priority: number
}

/**
 * Options for {@link defineViewProvider}.
 */
export interface ViewProviderOptions {
  priority?: number
  isClass?: boolean
  isFactory?: boolean
  props?: Record<string, unknown>
}

/**
 * Declare a view provider that wraps the application root (imperative substrate).
 *
 * @param module - The provider component (or factory).
 * @param options - Composition and prop options.
 * @returns A normalized {@link MetaViewProvider}.
 */
export function defineViewProvider<T = unknown> (module: T, options: ViewProviderOptions = {}): MetaViewProvider<T> {
  return {
    __viewProvider: true,
    module,
    isClass: options.isClass,
    isFactory: options.isFactory,
    props: options.props,
    priority: options.priority ?? 10
  }
}

/**
 * Type guard for {@link MetaViewProvider}.
 *
 * @param value - The value to test.
 * @returns True if it is a view provider descriptor.
 */
export function isViewProvider<T = unknown> (value: unknown): value is MetaViewProvider<T> {
  return typeof value === 'object' && value !== null && (value as { __viewProvider?: unknown }).__viewProvider === true
}

/**
 * Compose registered providers around a children node, engine-agnostically.
 *
 * Providers are sorted by ascending priority (lower = outer) and nested so the lowest-priority
 * provider is the outermost wrapper. `createElement` and `resolve` are supplied by the concrete
 * engine (React/Vue), keeping this function framework-free.
 *
 * @param providers - The registered providers.
 * @param children - The app node to wrap.
 * @param createElement - The engine's element factory.
 * @param resolve - Resolves a provider descriptor to a renderable component (DI-aware).
 * @param baseProps - Props merged into every provider element (e.g. a shared context).
 * @returns The wrapped node.
 */
export function composeProviders<VNode> (
  providers: Array<MetaViewProvider<unknown>>,
  children: VNode,
  createElement: (component: unknown, props: Record<string, unknown> | null, ...children: VNode[]) => VNode,
  resolve: (provider: MetaViewProvider<unknown>) => unknown,
  baseProps: Record<string, unknown> = {}
): VNode {
  const sorted = [...providers].sort((a, b) => a.priority - b.priority)
  return sorted.reduceRight<VNode>((acc, provider) => {
    const component = resolve(provider)
    return createElement(component, { ...baseProps, ...provider.props }, acc)
  }, children)
}
