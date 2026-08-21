import { IncomingBrowserEvent } from '@stone-js/browser-core'

/**
 * Options for {@link makeIncomingBrowserEvent}.
 */
export interface MakeBrowserEventOptions {
  /**
   * Full URL or path (default `/`).
   *
   * A path is resolved against `http://localhost`. A native application's own scheme works too:
   * `myapp://tasks/42` is what a deep link arrives as, and testing it is the point.
   */
  url?: string

  /** Metadata the event carries, readable through `event.get`. */
  metadata?: Record<string, unknown>
}

/**
 * Build a ready-to-dispatch `IncomingBrowserEvent` for tests.
 *
 * This is the event a browser application and a React Native one actually receive, and the reason it
 * has to exist separately from {@link makeIncomingEvent}: the React renderer keys its hydration
 * snapshot on `event.fingerprint()`, which the platform-agnostic event does not carry. Dispatching
 * the agnostic one into a rendering application fails with `event.fingerprint is not a function`,
 * from inside the kernel's error handler, which says nothing about what is missing.
 *
 * It lives behind `@stone-js/testing/browser` so that `@stone-js/browser-core` is only needed by the
 * projects that render: a service has no reason to install a browser package to run its tests.
 *
 * @example
 * ```ts
 * const app = await createTestApp({ platform: REACT_NATIVE_PLATFORM })
 * const response = await app.send(makeIncomingBrowserEvent({ url: 'myapp://tasks/42' }))
 * ```
 *
 * @param options - The event options.
 * @returns The incoming browser event.
 */
export function makeIncomingBrowserEvent (options: MakeBrowserEventOptions = {}): IncomingBrowserEvent {
  const { url = '/', metadata = {} } = options
  // A scheme-less value is a path, and a path needs an origin to become a URL. Anything with a
  // scheme is taken as written, so an application's own deep-link scheme survives.
  const resolved = /^[a-z][a-z0-9+.-]*:/i.test(url) ? new URL(url) : new URL(url, 'http://localhost')

  return IncomingBrowserEvent.create({
    metadata,
    url: resolved,
    source: { rawEvent: {}, platform: 'test', rawContext: {} }
  })
}
