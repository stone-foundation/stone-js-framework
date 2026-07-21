/** Reserved lifecycle routing keys dispatched by the transports/adapters. */
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
