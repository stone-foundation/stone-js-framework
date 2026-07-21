import { createKeyDecorator } from '@stone-js/key-router'
import { REALTIME_HANDLER_KEY, CONNECT, DISCONNECT, MESSAGE, ERROR, SUBSCRIBE, UNSUBSCRIBE, eventKey } from '../constants'

/** The shared `(key) => MethodDecorator` factory backing every realtime handler decorator. */
const onKey: (key: string) => MethodDecorator = createKeyDecorator(REALTIME_HANDLER_KEY)

/**
 * Method decorator: handle new connections.
 *
 * The method runs when a transport (WS/SSE adapter) accepts a connection; it receives the
 * {@link Connection}. Use it on a method of a `@RealtimeGateway()` class.
 *
 * @returns A method decorator.
 *
 * @example
 * ```typescript
 * @RealtimeGateway()
 * export class Presence {
 *   @OnConnect() onConnect (connection) { ... }
 * }
 * ```
 */
export const OnConnect = (): MethodDecorator => onKey(CONNECT)

/**
 * Method decorator: handle closed connections.
 *
 * The method runs when a connection closes; it receives the {@link Connection}.
 *
 * @returns A method decorator.
 */
export const OnDisconnect = (): MethodDecorator => onKey(DISCONNECT)

/**
 * Method decorator: handle raw inbound messages.
 *
 * The method runs for every message a connection sends; it receives `(message, connection)`.
 *
 * @returns A method decorator.
 */
export const OnMessage = (): MethodDecorator => onKey(MESSAGE)

/**
 * Method decorator: handle transport errors.
 *
 * The method runs when a connection errors; it receives `(error, connection)`.
 *
 * @returns A method decorator.
 */
export const OnError = (): MethodDecorator => onKey(ERROR)

/**
 * Method decorator: handle channel subscriptions.
 *
 * The method runs when a connection subscribes to a channel; it receives `(channel, connection)`.
 *
 * @returns A method decorator.
 */
export const OnSubscribe = (): MethodDecorator => onKey(SUBSCRIBE)

/**
 * Method decorator: handle channel unsubscriptions.
 *
 * The method runs when a connection leaves a channel; it receives `(channel, connection)`.
 *
 * @returns A method decorator.
 */
export const OnUnsubscribe = (): MethodDecorator => onKey(UNSUBSCRIBE)

/**
 * Method decorator: handle a specific event on a specific channel.
 *
 * The method runs when the named event arrives on the channel; it receives `(payload, connection)`.
 *
 * @param channel - The channel to listen on.
 * @param event - The event name to handle.
 * @returns A method decorator.
 *
 * @example
 * ```typescript
 * @RealtimeGateway()
 * export class Chat {
 *   @OnEvent('room:1', 'message') onMessage (payload, connection) { ... }
 * }
 * ```
 */
export const OnEvent = (channel: string, event: string): MethodDecorator => onKey(eventKey(channel, event))
