/**
 * Class decorator: mark a class as a realtime gateway.
 *
 * A realtime-flavoured alias of the light router's `@KeyHandler`: the class is registered as a
 * service and its `@OnConnect`/`@OnDisconnect`/`@OnMessage`/`@OnError`/`@OnSubscribe`/`@OnUnsubscribe`/
 * `@OnEvent` methods are wired into the `@stone-js/router` light key-router, which a WS adapter drives
 * through the kernel.
 *
 * @example
 * ```typescript
 * @RealtimeGateway()
 * export class Chat {
 *   constructor (private readonly realtime) {}
 *   @OnConnect() onConnect (_, event) { const connection = connectionOf(event) }
 *   @OnEvent('room:1', 'message') onMessage (payload, event) { ... }
 * }
 * ```
 */
export { KeyHandler as RealtimeGateway } from '@stone-js/router'
