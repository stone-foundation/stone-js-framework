import { RawResponseWrapper } from './RawResponseWrapper'
import { NavigationSource } from './NavigationSource'
import { AdapterContext, IAdapterEventBuilder, Promiseable, RawResponseOptions } from '@stone-js/core'
import { IncomingBrowserEvent, IncomingBrowserEventOptions, OutgoingBrowserResponse } from '@stone-js/browser-core'

/**
 * A navigation intent: the one cause this adapter captures.
 *
 * Everything a native application can ask of the domain arrives as an intent to show a
 * URL: the cold start, a deep link, a push-notification tap, an in-app navigation. They
 * differ in where they come from, not in what they mean, so the adapter normalizes all of
 * them into this shape before the kernel sees anything.
 */
export interface NavigationIntent {
  /** The URL to resolve. Relative paths are resolved against the configured base URL. */
  url: string

  /** Navigation metadata, the native counterpart of the browser's `history.state`. */
  metadata?: unknown

  /** Where the intent came from, for logging and for handlers that care. */
  origin?: NavigationOrigin
}

/**
 * Where a navigation intent came from.
 *
 * - `launch`: the URL the application was opened with (cold start, deep link included).
 * - `deep-link`: a URL delivered while the application was already running.
 * - `in-app`: a `navigate()` call from the application itself.
 */
export type NavigationOrigin = 'launch' | 'deep-link' | 'in-app'

/**
 * A listener notified of navigation intents.
 */
export type NavigationListener = (intent: NavigationIntent) => void

/**
 * The subset of React Native's `Linking` module this adapter uses.
 *
 * Declared structurally rather than imported, for two reasons: the adapter must be
 * testable without a native runtime, and it must not make `react-native` a hard
 * dependency of a package that a server-side test suite may pull in transitively.
 */
export interface LinkingLike {
  /** The URL the application was opened with, if any. */
  getInitialURL: () => Promise<string | null>

  /** Subscribe to URLs delivered while the application runs. */
  addEventListener: (type: 'url', handler: (event: { url: string }) => void) => { remove: () => void }
}

/**
 * Resolves the platform's linking module, or nothing when there is none.
 *
 * The default resolver imports `react-native` lazily and returns `undefined` when it is
 * absent, which is what makes the adapter usable under a plain Node test runner.
 */
export type LinkingResolver = () => Promiseable<LinkingLike | undefined>

/**
 * The raw platform response.
 *
 * A native platform has no transport response to write: the effect is a render, so the
 * raw response is whatever the renderer returns.
 */
export type ReactNativeResponse = unknown

/**
 * Raw response options carrying the deferred render effect.
 *
 * The view layer contributes `render` from a response middleware; the adapter calls it
 * once the kernel has resolved the outgoing response. Without a view layer the render is
 * absent and the adapter simply returns nothing, which is the headless case.
 */
export interface RawReactNativeResponseOptions extends RawResponseOptions {
  render?: () => Promiseable<ReactNativeResponse>
}

/**
 * The execution context handed to the adapter's middleware.
 *
 * Where the browser adapter passes `window`, this passes the navigation source: the thing
 * that produced the intent and that the application navigates through.
 */
export type ReactNativeContext = NavigationSource

/**
 * The adapter context for the React Native adapter.
 */
export type ReactNativeAdapterContext = AdapterContext<
NavigationIntent,
ReactNativeResponse,
ReactNativeContext,
IncomingBrowserEvent,
IncomingBrowserEventOptions,
OutgoingBrowserResponse
>

/**
 * The response builder used by the adapter's middleware.
 */
export type ReactNativeAdapterResponseBuilder = IAdapterEventBuilder<RawReactNativeResponseOptions, RawResponseWrapper>
