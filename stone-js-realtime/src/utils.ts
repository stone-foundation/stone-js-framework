import { IncomingEvent } from '@stone-js/core'
import { Connection } from './declarations'

/**
 * Resolve a module's default export across ESM/CJS interop.
 *
 * @param mod - The imported module namespace.
 * @returns The default export.
 */
export function resolveModuleDefault<T = any> (mod: any): T {
  return (mod?.default ?? mod) as T
}

/**
 * Read the {@link Connection} a WS adapter attached to an incoming realtime event.
 *
 * Gateways receive `(payload, event)`; use this to reach the originating connection uniformly across
 * `@OnConnect`, `@OnEvent`, and the rest.
 *
 * @param event - The incoming event.
 * @returns The connection, or `undefined` when absent.
 */
export function connectionOf<T = unknown> (event: IncomingEvent): Connection<T> | undefined {
  return event.get<Record<string, any>>('metadata', {})?.connection
}
