import { KeyRouter, KeyHandler } from '@stone-js/key-router'
import { CONNECT, DISCONNECT, MESSAGE, ERROR, SUBSCRIBE, UNSUBSCRIBE, eventKey } from './constants'

/**
 * Routes realtime keys (lifecycle events and channel events) to their handlers.
 *
 * A thin, transport-agnostic facade over {@link KeyRouter}: a WS/SSE adapter dispatches lifecycle
 * events (`connect`, `disconnect`, `message`, `error`, `subscribe`, `unsubscribe`) and channel events
 * (`event:<channel>:<event>`) into it; the module populates it from the `@On*`-decorated methods.
 * The core is never touched: this is a plain registry the adapters drive.
 */
export class RealtimeRouter {
  private static current?: RealtimeRouter

  /**
   * @param router - The underlying key router.
   */
  private constructor (private readonly router: KeyRouter) {}

  /**
   * Create a RealtimeRouter.
   *
   * @param router - The underlying key router (defaults to a fresh one).
   * @returns A new router.
   */
  static create (router: KeyRouter = KeyRouter.create()): RealtimeRouter {
    return new this(router)
  }

  /**
   * Register (or replace) the process-wide default router.
   *
   * @param router - The router (or `undefined` to clear).
   */
  static setInstance (router?: RealtimeRouter): void {
    RealtimeRouter.current = router
  }

  /**
   * The process-wide default router, if the realtime module has been booted.
   *
   * @returns The router, or `undefined`.
   */
  static getInstance (): RealtimeRouter | undefined {
    return RealtimeRouter.current
  }

  /**
   * Register a handler for a routing key.
   *
   * @param key - The routing key (a lifecycle key or `event:<channel>:<event>`).
   * @param handler - The handler (function or object with an action method).
   * @param action - The method to call for object handlers (defaults to `handle`).
   * @returns This router for chaining.
   */
  register (key: string, handler: KeyHandler, action: string = 'handle'): this {
    this.router.register(key, handler, action)
    return this
  }

  /**
   * Whether a handler is registered for a key.
   *
   * @param key - The routing key.
   * @returns True if registered.
   */
  has (key: string): boolean {
    return this.router.has(key)
  }

  /**
   * The registered routing keys.
   *
   * @returns The keys.
   */
  keys (): string[] {
    return this.router.keys()
  }

  /**
   * Dispatch a key to its handler, if any (a no-op when nothing is registered).
   *
   * @param key - The routing key.
   * @param args - The arguments to pass to the handler.
   * @returns The handler's result, or `undefined` when no handler is registered.
   */
  async dispatch<R = unknown>(key: string, ...args: any[]): Promise<R | undefined> {
    const handler = this.router.tryResolve(key)
    if (handler === undefined) { return undefined }
    return await handler(...args) as R
  }

  /**
   * Dispatch the `connect` lifecycle event.
   *
   * @param args - The arguments (typically the connection).
   * @returns The handler's result, if any.
   */
  async connect<R = unknown>(...args: any[]): Promise<R | undefined> {
    return await this.dispatch<R>(CONNECT, ...args)
  }

  /**
   * Dispatch the `disconnect` lifecycle event.
   *
   * @param args - The arguments (typically the connection).
   * @returns The handler's result, if any.
   */
  async disconnect<R = unknown>(...args: any[]): Promise<R | undefined> {
    return await this.dispatch<R>(DISCONNECT, ...args)
  }

  /**
   * Dispatch the `message` lifecycle event.
   *
   * @param args - The arguments (typically the connection and the message).
   * @returns The handler's result, if any.
   */
  async message<R = unknown>(...args: any[]): Promise<R | undefined> {
    return await this.dispatch<R>(MESSAGE, ...args)
  }

  /**
   * Dispatch the `error` lifecycle event.
   *
   * @param args - The arguments (typically the connection and the error).
   * @returns The handler's result, if any.
   */
  async error<R = unknown>(...args: any[]): Promise<R | undefined> {
    return await this.dispatch<R>(ERROR, ...args)
  }

  /**
   * Dispatch the `subscribe` lifecycle event.
   *
   * @param args - The arguments (typically the connection and the channel).
   * @returns The handler's result, if any.
   */
  async subscribe<R = unknown>(...args: any[]): Promise<R | undefined> {
    return await this.dispatch<R>(SUBSCRIBE, ...args)
  }

  /**
   * Dispatch the `unsubscribe` lifecycle event.
   *
   * @param args - The arguments (typically the connection and the channel).
   * @returns The handler's result, if any.
   */
  async unsubscribe<R = unknown>(...args: any[]): Promise<R | undefined> {
    return await this.dispatch<R>(UNSUBSCRIBE, ...args)
  }

  /**
   * Dispatch a channel event to its `@OnEvent(channel, event)` handler.
   *
   * @param channel - The channel.
   * @param event - The event name.
   * @param args - The arguments (typically the payload and the connection).
   * @returns The handler's result, if any.
   */
  async event<R = unknown>(channel: string, event: string, ...args: any[]): Promise<R | undefined> {
    return await this.dispatch<R>(eventKey(channel, event), ...args)
  }
}
