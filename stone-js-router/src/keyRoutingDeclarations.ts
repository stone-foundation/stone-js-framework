import { IncomingEvent } from '@stone-js/core'

/**
 * The default incoming-event property the light router reads the routing key from.
 *
 * `detail-type` is where cloud buses (EventBridge) put the event name, so the emit/route pair
 * round-trips out of the box. It is not hard-coded: override it with `@KeyRouting({ source })` or a
 * full `extractor`.
 */
export const DEFAULT_KEY_SOURCE = 'detail-type'

/**
 * Extracts the routing key (and payload) from an incoming event.
 */
export type KeyRoutingExtractor = (event: IncomingEvent) => { key?: string, payload?: unknown }

/**
 * A key-route definition: which handler answers a routing key.
 */
export interface KeyRouteDefinition {
  /** The routing key. */
  key: string
  /** The handler: a function, an instance, a class or a factory. */
  module: unknown
  /** The method to call for class/factory handlers (defaults to `handle`). */
  action?: string
  /** Whether `module` is a class to resolve. */
  isClass?: boolean
  /** Whether `module` is a factory to resolve. */
  isFactory?: boolean
}

/**
 * A handler class carrying `@OnKey` methods, scanned and registered by the light router.
 */
export interface KeyHandlerDefinition {
  /** The handler class. */
  module: unknown
  /** Whether `module` is a class to resolve. */
  isClass?: boolean
  /** Whether `module` is a factory to resolve. */
  isFactory?: boolean
}

/**
 * The `stone.keyRouting` configuration bucket.
 */
export interface KeyRoutingConfig {
  /** The incoming-event property holding the routing key (defaults to `detail-type`). */
  source?: string
  /** A full extractor, taking precedence over `source`. */
  extractor?: KeyRoutingExtractor
  /** Throw when a key is missing/unmatched instead of no-op (defaults to false). */
  strict?: boolean
  /** Explicit key-route definitions. */
  definitions?: KeyRouteDefinition[]
  /** Handler classes (with `@OnKey` methods) to scan and register. */
  handlers?: KeyHandlerDefinition[]
}

/**
 * Build the default routing-key extractor.
 *
 * Reads the incoming event's `metadata` (the raw event the adapter captured), takes the key from the
 * configurable `source` property, and the payload from `metadata.detail` or the whole metadata.
 *
 * @param source - The metadata property holding the routing key.
 * @returns An extractor.
 */
export function defaultExtractor (source: string): KeyRoutingExtractor {
  return (event: IncomingEvent) => {
    const metadata = event.get<Record<string, any>>('metadata', {}) ?? {}
    const key = metadata[source]
    return { key: typeof key === 'string' ? key : undefined, payload: metadata.detail ?? metadata }
  }
}
