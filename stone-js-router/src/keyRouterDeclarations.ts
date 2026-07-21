/**
 * A key handler: a function, or an object/instance exposing an action method.
 */
export type KeyRouteHandler<A extends any[] = any[], R = unknown> =
  | ((...args: A) => R | Promise<R>)
  | Record<string, any>

/**
 * A normalized handler function.
 */
export type KeyHandlerFn<A extends any[] = any[], R = unknown> = (...args: A) => R | Promise<R>

/**
 * A handler meta-module for imperative registration (mirrors the framework's `{ module, isClass?,
 * isFactory? }` meta-module shape, plus the routing `key` and optional `action`).
 */
export interface KeyHandlerMeta {
  /** The key this handler answers (job name, event name, command name, route key…). */
  key: string
  /** The handler: a function, an instance, a class or a factory. */
  module: unknown
  /** The method to call when `module` is a class/factory instance (defaults to `handle`). */
  action?: string
  /** Whether `module` is a class to resolve. */
  isClass?: boolean
  /** Whether `module` is a factory to resolve. */
  isFactory?: boolean
}

/**
 * A method-level handler descriptor collected from a class's metadata: which `key` a method answers.
 */
export interface KeyMethodHandler {
  /** The key the method answers. */
  key: string
  /** The method name on the class. */
  action: string
}
