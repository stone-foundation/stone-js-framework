import { DEFAULT_BASE_URL } from './constants'
import { LinkingLike, LinkingResolver, NavigationIntent, NavigationListener, NavigationOrigin } from './declarations'

/**
 * The default linking resolver: React Native's own `Linking` module, or nothing.
 *
 * Imported lazily and inside a `try`, so the package works in three places with no
 * configuration: a device (the module is there), a plain Node test suite (it is not), and
 * a server-side build that happens to pull this package in (it is not, and nothing breaks).
 *
 * @returns The linking module, or `undefined` when the platform has none.
 */
export const defaultLinkingResolver: LinkingResolver = async (): Promise<LinkingLike | undefined> => {
  try {
    const reactNative = await import('react-native')
    return (reactNative as unknown as { Linking?: LinkingLike }).Linking
  } catch {
    return undefined
  }
}

/**
 * Options for creating a navigation source.
 */
export interface NavigationSourceOptions {
  /** The base every relative path is resolved against. Defaults to `stone://app`. */
  baseUrl?: string

  /** Resolves the platform's linking module. Defaults to {@link defaultLinkingResolver}. */
  linkingResolver?: LinkingResolver
}

/**
 * Where navigation intents come from, and how the application emits its own.
 *
 * This is the native counterpart of `window` for the browser adapter: the object the
 * adapter listens to and that middleware receives as the execution context. It holds no
 * React Native import of its own, so the same instance drives a device and a test.
 *
 * Two things arrive from outside (the launch URL and deep links) and one from inside
 * (`navigate`), and all three are the same kind of event, which is why the router does not
 * need to know which one it is answering.
 */
export class NavigationSource {
  private readonly baseUrl: string
  private readonly linkingResolver: LinkingResolver
  private readonly listeners = new Set<NavigationListener>()
  private subscription?: { remove: () => void }

  /**
   * Create a navigation source.
   *
   * @param options - The source options.
   * @returns A new navigation source.
   */
  static create (options: NavigationSourceOptions = {}): NavigationSource {
    return new this(options)
  }

  /**
   * Create a navigation source.
   *
   * @param options - The source options.
   */
  private constructor ({ baseUrl, linkingResolver }: NavigationSourceOptions = {}) {
    this.baseUrl = baseUrl ?? DEFAULT_BASE_URL
    this.linkingResolver = linkingResolver ?? defaultLinkingResolver
  }

  /**
   * Register a listener for navigation intents.
   *
   * @param listener - The listener to register.
   * @returns A function removing the listener.
   */
  subscribe (listener: NavigationListener): () => void {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  /**
   * Navigate from within the application.
   *
   * This is what the router's navigator calls, so a `router.navigate('/tasks')` in a page
   * re-enters the kernel exactly like a deep link would.
   *
   * @param url - The target URL or path.
   * @param metadata - Navigation metadata, the native `history.state`.
   */
  navigate (url: string, metadata?: unknown): void {
    this.emit({ url, metadata, origin: 'in-app' })
  }

  /**
   * Start listening to the platform: read the launch URL, then subscribe to deep links.
   *
   * Idempotent: an existing subscription is removed first, so a hot reload cannot leave
   * two listeners answering the same link.
   *
   * @returns The launch URL when the application was opened with one.
   */
  async bind (): Promise<string | undefined> {
    this.unbind()

    const linking = await this.linkingResolver()

    if (linking === undefined) { return undefined }

    this.subscription = linking.addEventListener('url', ({ url }) => {
      this.emit({ url, origin: 'deep-link' })
    })

    return (await linking.getInitialURL()) ?? undefined
  }

  /**
   * Stop listening to the platform. Safe to call when never bound.
   */
  unbind (): void {
    this.subscription?.remove()
    this.subscription = undefined
  }

  /**
   * Remove every listener and unbind. Used on adapter teardown.
   */
  clear (): void {
    this.unbind()
    this.listeners.clear()
  }

  /**
   * Resolve an intent's URL into an absolute one.
   *
   * A deep link already carries its scheme and host; an in-app path does not, and the
   * router needs a real URL to match against. Resolving here rather than in the middleware
   * keeps the base URL in one place.
   *
   * @param url - The URL or path to resolve.
   * @returns The absolute URL.
   */
  resolveUrl (url: string): URL {
    return new URL(url, `${this.baseUrl}/`)
  }

  /**
   * Emit an intent to every listener.
   *
   * @param intent - The intent to emit.
   */
  private emit (intent: NavigationIntent): void {
    this.listeners.forEach((listener) => listener(intent))
  }

  /**
   * Build the intent the adapter dispatches when it starts.
   *
   * The application always resolves something on launch: the URL it was opened with when
   * there is one, the base path otherwise. That is the native equivalent of the browser
   * adapter's synthetic first navigation.
   *
   * @param launchUrl - The URL the application was opened with, if any.
   * @returns The launch intent.
   */
  makeLaunchIntent (launchUrl?: string): NavigationIntent {
    const origin: NavigationOrigin = 'launch'
    return { url: launchUrl ?? '/', origin }
  }
}
