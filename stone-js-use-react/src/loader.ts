/**
 * Server data-loading API for React pages, re-exported from `@stone-js/use-view`.
 *
 * A page's `handle(event)` is its loader. For fine control over the SSR ⇄ CSR boundary —
 * e.g. fetching authenticated data from an API during SSR with the request token, and
 * degrading gracefully when it fails — wrap the fetch in a server loader:
 *
 * ```tsx
 * import { defineServerLoader, runServerLoader, createServerLoaderContext } from '@stone-js/use-react'
 *
 * const loadUser = defineServerLoader(async ({ token, fetch }) => {
 *   const res = await fetch('/api/me', { headers: { authorization: `Bearer ${token}` } })
 *   if (!res.ok) throw new Error('unauthorized')
 *   return res.json()
 * }, { policy: 'server-first' }) // try on the server; on failure, defer to the client
 *
 * class ProfilePage implements IPage<ReactIncomingEvent> {
 *   async handle (event: ReactIncomingEvent) {
 *     const ctx = createServerLoaderContext({
 *       event,
 *       isServer: typeof window === 'undefined',
 *       cookies: event.get('cookies', {}),
 *       tokenCookieName: 'session'
 *     })
 *     const outcome = await runServerLoader(loadUser, ctx)
 *     return outcome.data // undefined when deferred/given-up → the component renders a loading/empty state
 *   }
 * }
 * ```
 */
export {
  defineServerLoader,
  runServerLoader,
  createServerLoaderContext,
  isServerLoader
} from '@stone-js/use-view'

export type {
  ServerLoaderContext,
  ServerLoaderPolicy,
  ServerLoaderOptions,
  ServerLoaderDescriptor,
  LoadOutcome,
  LoadStatus,
  StreamRenderOptions,
  PrerenderTarget,
  PrerenderResult,
  PrerenderContract
} from '@stone-js/use-view'
