import { IncomingHttpEvent } from '@stone-js/http-core'

/**
 * The HTTP event factory.
 *
 * Behind `@stone-js/testing/http` so that `@stone-js/http-core` is an optional peer: a native
 * application, a CLI one or a worker has no reason to install an HTTP package to run its tests, and
 * before this split every project did, because the package's main entry imported it.
 */
/**
 * Options for {@link makeIncomingHttpEvent}.
 */
export interface MakeHttpEventOptions {
  /** HTTP method (default `GET`). */
  method?: string
  /** Full URL or path (default `/`); a path is resolved against `http://localhost`. */
  url?: string
  /** Parsed request body. */
  body?: Record<string, unknown>
  /** Request headers. */
  headers?: Record<string, string>
  /** Client IP (default `127.0.0.1`). */
  ip?: string
}

/**
 * Builds a ready-to-dispatch `IncomingHttpEvent` for tests, with sensible defaults — no more
 * repeating `IncomingHttpEvent.create({ url: new URL(...) })` in every test.
 *
 * @param options - The event options.
 * @returns The incoming HTTP event.
 */
export function makeIncomingHttpEvent (options: MakeHttpEventOptions = {}): IncomingHttpEvent {
  const { method = 'GET', url = '/', body = {}, headers = {}, ip = '127.0.0.1' } = options
  const resolved = url.startsWith('http') ? new URL(url) : new URL(url, 'http://localhost')

  return IncomingHttpEvent.create({
    ip,
    body,
    headers,
    url: resolved,
    method: method.toUpperCase() as never,
    source: { rawEvent: {}, platform: 'test', rawContext: {} },
    queryString: resolved.search.startsWith('?') ? resolved.search.slice(1) : resolved.search
  })
}
