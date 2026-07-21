import { RawResponseWrapper } from './RawResponseWrapper'
import {
  AdapterContext,
  IAdapterEventBuilder,
  IncomingEvent,
  IncomingEventOptions,
  OutgoingResponse,
  RawResponseOptions
} from '@stone-js/core'

/**
 * A WebSocket connection, duck-typed over the `ws` `WebSocket` instance.
 *
 * The adapter never imports `ws` types at runtime; it relies on this minimal shape so `ws` stays an
 * optional peer dependency and a fake socket can drive the tests.
 */
export interface WsSocket {
  /** Send a serialized frame to the client. */
  send: (data: string) => void
  /** Close the connection. */
  close: (code?: number, reason?: string) => void
  /** Subscribe to a socket event (`message`, `close`, `error`). */
  on: (event: string, listener: (...args: any[]) => void) => void
}

/**
 * A WebSocket server, duck-typed over the `ws` `WebSocketServer` instance.
 */
export interface WsServer {
  /** Subscribe to a server event (`connection`, `error`, `close`). */
  on: (event: string, listener: (...args: any[]) => void) => void
  /** Close the server. */
  close: (callback?: (error?: Error) => void) => void
  /** The connected clients (when the server tracks them). */
  clients?: Set<WsSocket>
}

/** A raw inbound WebSocket event: the parsed frame. */
export type RawWsEvent = Record<string, unknown>

/** A raw outbound WebSocket response: the frame sent back to the socket. */
export type RawWsResponse = Record<string, unknown>

/**
 * The wire frame exchanged with clients (and the isomorphic `@stone-js/realtime` client):
 * a `type`, a `channel`, and for data frames an `event` and `payload`.
 */
export interface WsFrame {
  /** The frame kind (`event`, `subscribe`, `unsubscribe`); absent frames are treated as data. */
  type?: string
  /** The channel the frame targets. */
  channel?: string
  /** The event name (for data frames). */
  event?: string
  /** The payload (for data frames). */
  payload?: unknown
  /** Frames may carry arbitrary extra fields. */
  [key: string]: unknown
}

/**
 * The execution context passed to the kernel for a WebSocket message: the server, the originating
 * socket, and the connection id.
 */
export interface NodeWsExecutionContext {
  /** The WebSocket server. */
  server: WsServer
  /** The originating socket. */
  socket: WsSocket
  /** The stable connection id. */
  connectionId: string
}

/** The response builder for the Node.js WebSocket adapter. */
export type NodeWsAdapterResponseBuilder = IAdapterEventBuilder<RawResponseOptions, RawResponseWrapper>

/**
 * The adapter context for the Node.js WebSocket adapter.
 */
export interface NodeWsAdapterContext extends AdapterContext<
RawWsEvent,
RawWsResponse,
NodeWsExecutionContext,
IncomingEvent,
IncomingEventOptions,
OutgoingResponse
> {
  /** The raw response associated with the current context. */
  rawResponse: RawWsResponse
}

/**
 * A factory that builds the `ws` `WebSocketServer` from its options (used to inject a fake in tests).
 */
export type WsServerFactory = (options: Record<string, unknown>) => WsServer
