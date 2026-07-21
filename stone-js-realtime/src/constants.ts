/** Metadata key under which the realtime `@On*` decorators record their (key → method) mappings. */
export const REALTIME_HANDLER_KEY: symbol = Symbol.for('stone.realtime.handlers')

/** Reserved lifecycle keys dispatched by the transports/adapters. */
export const CONNECT = 'connect'
export const DISCONNECT = 'disconnect'
export const MESSAGE = 'message'
export const ERROR = 'error'
export const SUBSCRIBE = 'subscribe'
export const UNSUBSCRIBE = 'unsubscribe'

/** Build the routing key for a channel event handler (`@OnEvent`). */
export function eventKey (channel: string, event: string): string {
  return `event:${channel}:${event}`
}
