import { IncomingEvent } from '@stone-js/core'

/**
 * A message published on the bus: an event name and its payload.
 */
export interface BusMessage<T = unknown> {
  /** The event name (e.g. `order.shipped`). */
  name: string
  /** The payload. */
  payload: T
}

/**
 * Options for a single `emit` call.
 */
export interface EmitOptions {
  /** The target connections to publish to (defaults to the configured default targets). */
  targets?: string[]
  /** The EventBridge `Source` (event namespace); defaults to the configured source. */
  source?: string
  /** The EventBridge `DetailType`; defaults to the event name. */
  detailType?: string
  /** Driver-specific extras. */
  [key: string]: unknown
}

/**
 * A single bus connection (a driver instance): publishes an event to its backing transport.
 */
export interface EventBusConnection {
  /** A human-readable name (e.g. `local`, `cloud`, `eventbridge`). */
  readonly name: string
  /** Publish `name` with `payload`. */
  emit: <T = unknown>(name: string, payload?: T, options?: EmitOptions) => Promise<void>
}

/**
 * The agnostic event-bus contract the domain touches to publish.
 */
export interface IEventBus {
  /** Publish an event to the target connection(s). */
  emit: <T = unknown>(name: string, payload?: T, options?: EmitOptions) => Promise<void>
  /** Resolve a connection by name. */
  connection: (name?: string) => EventBusConnection
}

/** Built-in driver identifiers. `local` and `memory` ship now; `eventbridge` is the first cloud driver. */
export type EventBusDriver = 'local' | 'memory' | 'eventbridge' | string

/**
 * Options common to every connection, plus the driver selector.
 */
export interface ConnectionOptions {
  /** The connection name, used as a target and to resolve it. */
  name: string
  /** Which driver backs this connection. */
  driver: EventBusDriver
  /** Driver-specific options. */
  [key: string]: unknown
}

/**
 * Options for the EventBridge driver.
 */
export interface EventBridgeOptions extends ConnectionOptions {
  /** The default EventBridge `Source` for emitted events. */
  source?: string
  /** The event bus name (defaults to `default`). */
  busName?: string
  /** The AWS region (passed to the client when none is provided). */
  region?: string
  /** An existing `EventBridgeClient` to reuse. */
  client?: unknown
}

/**
 * A factory that builds an {@link EventBusConnection} from its options.
 */
export type ConnectionFactory = (options: ConnectionOptions) => EventBusConnection

/**
 * Extracts the routing key (and payload) from an incoming event for the listener.
 */
export type BusEventExtractor = (event: IncomingEvent) => { key?: string, payload?: unknown }

/**
 * The listener configuration: which incoming-event property carries the routing key, or a full
 * extractor for non-trivial shapes.
 */
export interface BusListenConfig {
  /** The incoming-event property holding the routing key (defaults to `detail-type`). */
  source?: string
  /** A full extractor, taking precedence over `source`. */
  extractor?: BusEventExtractor
}

/**
 * A bus-handler meta-module for imperative registration under `stone.eventBus.handlers`.
 */
export interface BusHandlerMeta {
  /** The event name this handler answers (omit when using `@OnBusEvent` methods). */
  name?: string
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
 * The `stone.eventBus` configuration bucket.
 */
export interface EventBusConfig {
  /** The default connection name for `connection()`. */
  default?: string
  /** The default targets for `emit` when none are given. */
  targets?: string[]
  /** The connections to register. */
  connections?: ConnectionOptions[]
  /** The handlers (classes with `@OnBusEvent` methods, or named handlers) to register. */
  handlers?: BusHandlerMeta[]
  /** The listener configuration (enables routing incoming bus events to handlers). */
  listen?: BusListenConfig
}
