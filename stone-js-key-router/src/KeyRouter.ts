import { KeyRouterError } from './errors/KeyRouterError'
import { KeyHandler, KeyHandlerFn } from './declarations'

/**
 * A minimal key → handler router.
 *
 * The small sibling of `@stone-js/router`: no paths, params, constraints or groups, just "this key
 * maps to this handler". It is the reusable core behind job dispatch (job name → handler), realtime
 * events (event name → handler), CLI commands (command → handler) and any simple adapter that keys
 * work by an event type. Handlers may be plain functions or objects/instances with an action method.
 */
export class KeyRouter {
  private readonly handlers = new Map<string, KeyHandlerFn>()

  /**
   * Create a KeyRouter.
   *
   * @returns A new router.
   */
  static create (): KeyRouter {
    return new this()
  }

  /**
   * Register a handler for a key.
   *
   * @param key - The routing key.
   * @param handler - The handler (function or object with an action method).
   * @param action - The method to call for object handlers (defaults to `handle`).
   * @returns This router for chaining.
   */
  register (key: string, handler: KeyHandler, action: string = 'handle'): this {
    this.handlers.set(key, this.normalize(handler, action))
    return this
  }

  /**
   * Whether a handler is registered for a key.
   *
   * @param key - The routing key.
   * @returns True if registered.
   */
  has (key: string): boolean {
    return this.handlers.has(key)
  }

  /**
   * The registered keys.
   *
   * @returns The keys.
   */
  keys (): string[] {
    return [...this.handlers.keys()]
  }

  /**
   * Resolve the handler for a key, or `undefined` when absent.
   *
   * @param key - The routing key.
   * @returns The handler, or `undefined`.
   */
  tryResolve (key: string): KeyHandlerFn | undefined {
    return this.handlers.get(key)
  }

  /**
   * Resolve the handler for a key.
   *
   * @param key - The routing key.
   * @returns The normalized handler function.
   * @throws {KeyRouterError} When no handler is registered.
   */
  resolve (key: string): KeyHandlerFn {
    const handler = this.handlers.get(key)
    if (handler === undefined) {
      throw new KeyRouterError(`No handler registered for key "${key}".`)
    }
    return handler
  }

  /**
   * Resolve and invoke the handler for a key.
   *
   * @param key - The routing key.
   * @param args - The arguments to pass to the handler.
   * @returns The handler's result.
   * @throws {KeyRouterError} When no handler is registered.
   */
  async dispatch<R = unknown>(key: string, ...args: any[]): Promise<R> {
    return await this.resolve(key)(...args) as R
  }

  /**
   * Normalize a handler to a plain function.
   *
   * @param handler - The handler.
   * @param action - The method name for object handlers.
   * @returns A handler function.
   * @throws {KeyRouterError} When an object handler lacks the action method.
   */
  private normalize (handler: KeyHandler, action: string): KeyHandlerFn {
    if (typeof handler === 'function') { return handler as KeyHandlerFn }
    const method = handler?.[action]
    if (typeof method !== 'function') {
      throw new KeyRouterError(`Handler must be a function or expose a "${action}" method.`)
    }
    return method.bind(handler) as KeyHandlerFn
  }
}
