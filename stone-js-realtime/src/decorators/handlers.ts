import { createKeyDecorator, KEY_ROUTING_KEY } from '@stone-js/router'
import { CONNECT, DISCONNECT, MESSAGE, ERROR, SUBSCRIBE, UNSUBSCRIBE, eventKey } from '../constants'

/**
 * The shared `(key) => MethodDecorator` factory backing every realtime handler decorator.
 *
 * It writes to the light key-router's metadata key, so a `@RealtimeGateway()` (an alias of the light
 * router's `@KeyHandler`) has its methods routed by the kernel event handler the WS adapters drive.
 */
const onKey: (key: string) => MethodDecorator = createKeyDecorator(KEY_ROUTING_KEY)

/**
 * Method decorator: handle new connections.
 *
 * The method runs when a transport (WS adapter) accepts a connection. Like every keyed handler it
 * receives `(payload, event)`; for `connect` the payload is empty, read the connection with
 * `connectionOf(event)`.
 *
 * @returns A method decorator.
 *
 * @example
 * ```typescript
 * @RealtimeGateway()
 * export class Presence {
 *   @OnConnect() onConnect (_, event) { const connection = connectionOf(event) }
 * }
 * ```
 */
export const OnConnect = (): MethodDecorator => onKey(CONNECT)

/**
 * Method decorator: handle closed connections.
 *
 * Receives `(payload, event)`; the connection is `connectionOf(event)`.
 *
 * @returns A method decorator.
 */
export const OnDisconnect = (): MethodDecorator => onKey(DISCONNECT)

/**
 * Method decorator: handle raw inbound messages.
 *
 * Receives `(frame, event)` for every message a connection sends; the connection is
 * `connectionOf(event)`.
 *
 * @returns A method decorator.
 */
export const OnMessage = (): MethodDecorator => onKey(MESSAGE)

/**
 * Method decorator: handle transport errors.
 *
 * Receives `(error, event)`; the connection is `connectionOf(event)`.
 *
 * @returns A method decorator.
 */
export const OnError = (): MethodDecorator => onKey(ERROR)

/**
 * Method decorator: handle channel subscriptions.
 *
 * Receives `(channel, event)`; the connection is `connectionOf(event)`.
 *
 * @returns A method decorator.
 */
export const OnSubscribe = (): MethodDecorator => onKey(SUBSCRIBE)

/**
 * Method decorator: handle channel unsubscriptions.
 *
 * Receives `(channel, event)`; the connection is `connectionOf(event)`.
 *
 * @returns A method decorator.
 */
export const OnUnsubscribe = (): MethodDecorator => onKey(UNSUBSCRIBE)

/**
 * Method decorator: handle a specific event on a specific channel.
 *
 * Receives `(payload, event)` when the named event arrives on the channel; the connection is
 * `connectionOf(event)`.
 *
 * @param channel - The channel to listen on.
 * @param event - The event name to handle.
 * @returns A method decorator.
 *
 * @example
 * ```typescript
 * @RealtimeGateway()
 * export class Chat {
 *   @OnEvent('room:1', 'message') onMessage (payload, event) { ... }
 * }
 * ```
 */
export const OnEvent = (channel: string, event: string): MethodDecorator => onKey(eventKey(channel, event))
