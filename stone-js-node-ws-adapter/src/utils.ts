import { WsFrame } from './declarations'

/**
 * Resolve the `WebSocketServer` constructor from the (lazily imported) `ws` module, tolerating both
 * the named export and a default-wrapped interop shape.
 *
 * @param mod - The imported `ws` module namespace.
 * @returns The `WebSocketServer` constructor, or `undefined` when absent.
 */
export function resolveWebSocketServer (mod: any): any {
  return mod?.WebSocketServer ?? mod?.default?.WebSocketServer ?? mod?.default ?? mod
}

/**
 * Parse a raw WebSocket payload into a {@link WsFrame}.
 *
 * Accepts a string or anything stringifiable (a `Buffer`), and returns `undefined` on malformed
 * JSON so the caller can treat it as a protocol error rather than crashing the socket.
 *
 * @param data - The raw payload.
 * @returns The parsed frame, or `undefined`.
 */
export function parseFrame (data: unknown): WsFrame | undefined {
  try {
    const raw = typeof data === 'string' ? data : String(data)
    const frame = JSON.parse(raw)
    return (typeof frame === 'object' && frame !== null) ? frame as WsFrame : undefined
  } catch {
    return undefined
  }
}
