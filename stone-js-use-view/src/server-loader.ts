/**
 * Server data-loading mechanism for universal rendering.
 *
 * This is NOT a set of use-cases — it is the structure, tools and policy engine that let a
 * view load its data with full control over the SSR ⇄ CSR boundary, so the framework handles
 * the hard cases (authenticated fetch during SSR, graceful degradation, hydration hand-off)
 * that other frameworks discover late and patch.
 *
 * Example the mechanism is built for: an authenticated user page. During SSR we try to fetch
 * the user from the API using the request's token; if that fails we don't crash the render —
 * depending on the policy we either give up (server-only) or defer the fetch to the client
 * (server-first). The loader never guesses: the policy decides.
 *
 * ```ts
 * const loadUser = defineServerLoader(async ({ token, fetch }) => {
 *   const res = await fetch('/api/me', { headers: { authorization: `Bearer ${token}` } })
 *   if (!res.ok) throw new Error('unauthorized')
 *   return res.json()
 * }, { policy: 'server-first' }) // try on the server, fall back to the client on failure
 * ```
 */

/**
 * Context handed to a server loader. Carries the request, the resolved auth token and
 * cookies, an abort signal, a credentials-aware `fetch`, and the runtime side (server/client).
 *
 * @template EventType - The incoming event type.
 */
export interface ServerLoaderContext<EventType = unknown> {
  /** The incoming event (request/intention). */
  event: EventType
  /** True during server-side rendering. */
  isServer: boolean
  /** True in the browser. */
  isClient: boolean
  /** Auth token resolved from the request (cookie/header), if any. */
  token?: string
  /** Parsed request cookies. */
  cookies: Record<string, string>
  /** A fetch implementation (credentials-aware on the server). */
  fetch: typeof fetch
  /** Abort signal to cancel the load (e.g. request aborted). */
  signal?: AbortSignal
}

/**
 * How a loader behaves across the SSR/CSR boundary.
 *
 * - `server-first` : run on the server; on failure, defer to a client fetch (or fallback).
 * - `server-only`  : run only on the server; on failure, use the fallback or give up (never client).
 * - `client-only`  : never run on the server (needs the browser); always fetched on the client.
 */
export type ServerLoaderPolicy = 'server-first' | 'server-only' | 'client-only'

/**
 * Options controlling a server loader.
 *
 * @template DataType - The data the loader returns.
 * @template EventType - The incoming event type.
 */
export interface ServerLoaderOptions<DataType = unknown, EventType = unknown> {
  /** Cross-boundary policy. Default `server-first`. */
  policy?: ServerLoaderPolicy
  /** Value used when the server load fails (and policy is not `client-only`). */
  fallback?: DataType
  /** Observe failures (e.g. logging); never throws. */
  onError?: (error: unknown, context: ServerLoaderContext<EventType>) => void
}

/**
 * A normalized server-loader descriptor produced by {@link defineServerLoader}.
 */
export interface ServerLoaderDescriptor<DataType = unknown, EventType = unknown> {
  readonly __serverLoader: true
  policy: ServerLoaderPolicy
  load: (context: ServerLoaderContext<EventType>) => DataType | Promise<DataType>
  fallback?: DataType
  onError?: (error: unknown, context: ServerLoaderContext<EventType>) => void
}

/**
 * The outcome of running a loader — tells the renderer what to do next.
 *
 * - `server-loaded`      : data is ready, embed it in the SSR snapshot; no client refetch.
 * - `fallback`           : server load failed, using the fallback value; embed it, no refetch.
 * - `deferred-to-client` : run/refetch on the client after hydration (nothing in the snapshot).
 * - `given-up`           : server-only load failed with no fallback; render without the data.
 */
export type LoadStatus = 'server-loaded' | 'fallback' | 'deferred-to-client' | 'given-up'

/**
 * The result of {@link runServerLoader}.
 *
 * @template DataType - The loaded data type.
 */
export interface LoadOutcome<DataType = unknown> {
  status: LoadStatus
  data?: DataType
  error?: unknown
  /** Whether `data` should be serialized into the SSR snapshot for hydration. */
  snapshot: boolean
  /** Whether the client should (re)fetch after hydration. */
  clientFetch: boolean
}

/**
 * Type guard: is a value a server-loader descriptor?
 *
 * @param value - The value to test.
 * @returns True if it is a {@link ServerLoaderDescriptor}.
 */
export function isServerLoader<DataType = unknown, EventType = unknown> (
  value: unknown
): value is ServerLoaderDescriptor<DataType, EventType> {
  return typeof value === 'object' && value !== null && (value as { __serverLoader?: unknown }).__serverLoader === true
}

/**
 * Declare a server-preferred data loader (imperative substrate; the declarative layer builds on it).
 *
 * @param load - The loader function, called with a {@link ServerLoaderContext}.
 * @param options - Policy and fallback options.
 * @returns A normalized {@link ServerLoaderDescriptor}.
 */
export function defineServerLoader<DataType = unknown, EventType = unknown> (
  load: (context: ServerLoaderContext<EventType>) => DataType | Promise<DataType>,
  options: ServerLoaderOptions<DataType, EventType> = {}
): ServerLoaderDescriptor<DataType, EventType> {
  return {
    __serverLoader: true,
    load,
    policy: options.policy ?? 'server-first',
    fallback: options.fallback,
    onError: options.onError
  }
}

/**
 * Run a server loader against a context, applying its cross-boundary policy and failure handling.
 *
 * Never throws for expected load failures: the policy decides whether to fall back, defer to the
 * client, or give up. Genuine programming errors in `onError` are the caller's responsibility.
 *
 * @param descriptor - The loader descriptor.
 * @param context - The loader context.
 * @returns A {@link LoadOutcome} instructing the renderer.
 */
export async function runServerLoader<DataType = unknown, EventType = unknown> (
  descriptor: ServerLoaderDescriptor<DataType, EventType>,
  context: ServerLoaderContext<EventType>
): Promise<LoadOutcome<DataType>> {
  // Client-only: never touch the server; fetch on the client.
  if (descriptor.policy === 'client-only') {
    if (context.isServer) {
      return { status: 'deferred-to-client', snapshot: false, clientFetch: true }
    }
    const data = await descriptor.load(context)
    return { status: 'server-loaded', data, snapshot: false, clientFetch: false }
  }

  // On the client for a server-first/only loader: the data normally arrived via the snapshot;
  // if we reach here (SPA navigation), just run it on the client.
  if (context.isClient) {
    const data = await descriptor.load(context)
    return { status: 'server-loaded', data, snapshot: false, clientFetch: false }
  }

  // Server side: try to load with the request context (token, cookies).
  try {
    const data = await descriptor.load(context)
    return { status: 'server-loaded', data, snapshot: true, clientFetch: false }
  } catch (error) {
    descriptor.onError?.(error, context)

    if (descriptor.fallback !== undefined) {
      return { status: 'fallback', data: descriptor.fallback, error, snapshot: true, clientFetch: false }
    }

    if (descriptor.policy === 'server-only') {
      // Give up: render without the data (no client refetch). "Si échoue, on abandonne."
      return { status: 'given-up', error, snapshot: false, clientFetch: false }
    }

    // server-first: hand the fetch off to the client after hydration.
    return { status: 'deferred-to-client', error, snapshot: false, clientFetch: true }
  }
}

/**
 * Build a {@link ServerLoaderContext} from primitives. Resolves the auth token from the
 * cookies (by name) or a bearer `authorization` header value.
 *
 * @param options - Context primitives.
 * @returns A ready-to-use loader context.
 */
export function createServerLoaderContext<EventType = unknown> (options: {
  event: EventType
  isServer: boolean
  cookies?: Record<string, string>
  authorization?: string
  tokenCookieName?: string
  fetch?: typeof fetch
  signal?: AbortSignal
}): ServerLoaderContext<EventType> {
  const cookies = options.cookies ?? {}
  const cookieToken = options.tokenCookieName !== undefined ? cookies[options.tokenCookieName] : undefined
  const headerToken = options.authorization?.replace(/^Bearer\s+/i, '')

  return {
    event: options.event,
    isServer: options.isServer,
    isClient: !options.isServer,
    token: cookieToken ?? headerToken,
    cookies,
    fetch: options.fetch ?? globalThis.fetch,
    signal: options.signal
  }
}
