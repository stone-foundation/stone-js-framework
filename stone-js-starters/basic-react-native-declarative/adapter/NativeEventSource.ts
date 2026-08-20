/**
 * The native cause captured by the adapter: an intent to show a URL.
 *
 * On a real device this is what a deep link, a push-notification tap or an
 * in-app navigation collapses to. The proof-of-concept models all of them as
 * one tiny in-memory event source; the future `@stone-js/react-native-adapter`
 * will plug `Linking` and `AppState` into the exact same shape.
 */
export interface NativeNavigationEvent {
  /** The URL to resolve, e.g. `stone://app/hello/Noowow`. */
  url: string
  /** Optional navigation metadata, mirroring the browser's `history.state`. */
  metadata?: unknown
}

/**
 * A navigation listener registered by the adapter.
 */
export type NativeNavigationListener = (event: NativeNavigationEvent) => void

/**
 * The in-memory navigation event source: the native counterpart of `window`
 * for the browser adapter. It is pure JavaScript, so the same code runs under
 * React Native, Node (tests) and anywhere else.
 */
export class NativeEventSource {
  /** The synthetic first event, dispatched when the adapter starts. */
  public readonly initialUrl = 'stone://app/'

  private readonly listeners = new Set<NativeNavigationListener>()

  /**
   * Register a navigation listener.
   *
   * @param listener - The listener to register.
   * @returns A teardown function removing the listener.
   */
  subscribe (listener: NativeNavigationListener): () => void {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  /**
   * Emit a navigation intent, exactly like the router does in the browser
   * through the `@stonejs/router.navigate` custom event.
   *
   * @param url - The URL to navigate to.
   * @param metadata - Optional navigation metadata.
   */
  navigate (url: string, metadata?: unknown): void {
    this.listeners.forEach((listener) => listener({ url, metadata }))
  }
}

/**
 * The application-wide event source instance.
 */
export const nativeEventSource = new NativeEventSource()
