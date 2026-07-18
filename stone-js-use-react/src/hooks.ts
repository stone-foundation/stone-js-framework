import { RouteEvent } from '@stone-js/router'
import { Config } from '@stone-js/config'
import { ReactRuntime } from './ReactRuntime'
import { StoneContext } from './StoneContext'
import { HeadContext } from '@stone-js/use-view'
import { useContext, useEffect, useState } from 'react'
import { EventEmitter, IBlueprint, IContainer } from '@stone-js/core'
import { IRoute, IRouter, ReactIncomingEvent, StoneContextType } from './declarations'

/**
 * React hooks for Stone.js.
 *
 * Every page/component rendered by `@stone-js/use-react` is wrapped in `<StonePage>`, which
 * publishes the request-scoped {@link StoneContextType} (container, event, data) on React's
 * context. These hooks read that context and resolve framework services from the DI container,
 * so components reach the router, runtime, config, events, etc. without prop-drilling or
 * touching the container directly. They work identically on the server (SSR/SSG) and the
 * client (CSR/hydration).
 */

/**
 * Access the full Stone context (container, current event, page data) for the current render.
 *
 * @returns The Stone context.
 * @throws {Error} When called outside a Stone-rendered tree (no provider in scope).
 */
export function useStone (): StoneContextType {
  const context = useContext(StoneContext)
  if (context?.container === undefined) {
    throw new Error('useStone(): no Stone context found. Stone hooks can only be used inside a page/component rendered by @stone-js/use-react.')
  }
  return context
}

/**
 * Access the request-scoped service container.
 *
 * @returns The service container.
 */
export function useContainer (): IContainer {
  return useStone().container
}

/**
 * Access the current incoming event.
 *
 * @returns The incoming event for this render.
 */
export function useEvent (): ReactIncomingEvent {
  return useStone().event
}

/**
 * Access the raw, platform-specific event that produced this render.
 *
 * This is the untouched native event captured by the adapter (e.g. Node's
 * `IncomingMessage`, the AWS Lambda event, or the browser event). Returns `undefined`
 * when the adapter did not attach one. Prefer {@link useEvent} for normalised access;
 * reach for the raw event only for platform-specific needs.
 *
 * @template TRawEvent - The expected raw event type.
 * @returns The raw event, or `undefined`.
 */
export function useRawEvent<TRawEvent = unknown> (): TRawEvent | undefined {
  return useEvent().source?.rawEvent as TRawEvent | undefined
}

/**
 * Access the currently matched route, or `undefined` when none is active.
 *
 * Reactive on the client: it updates on every SPA navigation (the router's `ROUTED`
 * event). On the server it reflects the route matched for the current request.
 *
 * @returns The current route, or `undefined`.
 */
export function useRoute (): IRoute | undefined {
  const router = useRouter()
  const [route, setRoute] = useState<IRoute | undefined>(() => router.getCurrentRoute())

  useEffect(() => {
    const onRouted = (event: RouteEvent): void => { setRoute(event.get<IRoute>('route')) }
    router.on(RouteEvent.ROUTED, onRouted)
    return () => { router.off(RouteEvent.ROUTED, onRouted) }
  }, [router])

  return route
}

/**
 * Access the data produced by the page's `handle()` (its loader).
 *
 * @template TData - The shape returned by the page loader.
 * @returns The page data, or `undefined` when the page has no loader.
 */
export function useData<TData = unknown> (): TData | undefined {
  return useStone().data as TData | undefined
}

/**
 * Resolve any service from the container by its binding key (alias or class).
 *
 * @template TService - The resolved service type.
 * @param key - The binding key (e.g. `'router'`) or class constructor.
 * @returns The resolved service.
 */
export function useService<TService = unknown> (key: any): TService {
  return useContainer().make(key) as TService
}

/**
 * Access the application blueprint (merged, read-only configuration tree).
 *
 * @returns The blueprint.
 */
export function useBlueprint (): IBlueprint {
  return useContainer().make<IBlueprint>('blueprint')
}

/**
 * Access the application configuration.
 *
 * @returns The config instance.
 */
export function useConfig (): Config {
  return useContainer().make<Config>('config')
}

/**
 * Access the router (navigate, generate URLs, inspect the current route).
 *
 * @returns The router.
 */
export function useRouter (): IRouter {
  return useContainer().make<IRouter>('router')
}

/**
 * Access the React runtime (snapshots, head application, error rendering).
 *
 * @returns The React runtime.
 */
export function useRuntime (): ReactRuntime {
  return useContainer().make<ReactRuntime>('reactRuntime')
}

/**
 * Access the application event emitter (subscribe to / emit domain events).
 *
 * @returns The event emitter.
 */
export function useEventEmitter (): EventEmitter {
  return useContainer().make<EventEmitter>('eventEmitter')
}

/**
 * Apply a head context (title, metas, links, JSON-LD, …) from within a component.
 *
 * The head is applied to the live document after paint (client only); during SSR/SSG the
 * effect never runs, so the head must also be returned from the page's `head()` for the
 * server-rendered markup. Re-applies whenever `head` changes.
 *
 * @param head - The head context to apply.
 */
export function useHead (head: HeadContext): void {
  const runtime = useRuntime()
  useEffect(() => {
    if (typeof document !== 'undefined') { runtime.head(head) }
  }, [head])
}
