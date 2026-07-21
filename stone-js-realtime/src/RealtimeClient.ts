import { resolveModuleDefault } from './utils'
import { RealtimeError } from './errors/RealtimeError'
import { ALL_CHANNELS, Broadcaster, PresenceMember, RealtimeListener, RealtimeMessage } from './declarations'

/**
 * Options for the isomorphic {@link RealtimeClient}.
 */
export interface RealtimeClientOptions {
  /** The WebSocket endpoint to connect to. */
  url: string
  /** Optional subprotocols passed to the WebSocket. */
  protocols?: string | string[]
  /** A WebSocket implementation to use (defaults to the global one, else lazily `ws` on Node). */
  WebSocket?: any
}

/** A control/event frame exchanged with the server. */
interface Frame {
  /** The frame kind. */
  type: 'event' | 'subscribe' | 'unsubscribe'
  /** The channel. */
  channel: string
  /** The event name (for `event` frames). */
  event?: string
  /** The payload (for `event` frames). */
  payload?: unknown
}

/**
 * The isomorphic realtime client.
 *
 * The *same* {@link Broadcaster} API the backend uses, aimed at a server: `broadcast`/`to().emit`
 * send an event up the socket, `on` subscribes a local listener to incoming events. Runs in the
 * browser (global `WebSocket`) and on Node (lazy optional `ws`), so the domain code that emits and
 * listens is written once and the transport is resolved by the context.
 */
export class RealtimeClient implements Broadcaster {
  readonly name: string = 'client'

  private socket?: any
  private openPromise?: Promise<void>
  private readonly listeners = new Map<string, Set<RealtimeListener>>()

  /**
   * Create a realtime client.
   *
   * @param options - The client options.
   * @returns A new client.
   */
  static create (options: RealtimeClientOptions): RealtimeClient {
    return new this(options)
  }

  /**
   * @param options - The client options.
   */
  constructor (private readonly options: RealtimeClientOptions) {}

  /**
   * Whether the socket is open.
   *
   * @returns True once connected.
   */
  get connected (): boolean {
    return this.socket !== undefined
  }

  /**
   * Open the connection (idempotent).
   *
   * @returns A promise that resolves once the socket is open.
   */
  async connect (): Promise<void> {
    this.openPromise = this.openPromise ?? this.open()
    return await this.openPromise
  }

  /** @inheritdoc */
  async broadcast <T = unknown>(channel: string, event: string, payload?: T): Promise<void> {
    await this.send({ type: 'event', channel, event, payload })
  }

  /** @inheritdoc */
  to (channel: string): { emit: <T = unknown>(event: string, payload?: T) => Promise<void> } {
    return { emit: async <T = unknown>(event: string, payload?: T) => { await this.broadcast(channel, event, payload) } }
  }

  /** @inheritdoc */
  on <T = unknown>(channel: string, listener: RealtimeListener<T>): () => void {
    const set = this.listeners.get(channel) ?? new Set<RealtimeListener>()
    set.add(listener as RealtimeListener)
    this.listeners.set(channel, set)
    void this.subscribe(channel)
    return () => { this.listeners.get(channel)?.delete(listener as RealtimeListener) }
  }

  /** @inheritdoc */
  async members (_channel: string): Promise<PresenceMember[]> {
    // Presence is a server concern; the client tracks none locally.
    return []
  }

  /**
   * Subscribe the connection to a channel on the server.
   *
   * @param channel - The channel.
   */
  async subscribe (channel: string): Promise<void> {
    await this.send({ type: 'subscribe', channel })
  }

  /**
   * Unsubscribe the connection from a channel on the server.
   *
   * @param channel - The channel.
   */
  async unsubscribe (channel: string): Promise<void> {
    await this.send({ type: 'unsubscribe', channel })
  }

  /**
   * Close the connection.
   */
  close (): void {
    if (typeof this.socket?.close === 'function') { this.socket.close() }
    this.socket = undefined
    this.openPromise = undefined
  }

  /**
   * Serialize and send a frame (connecting first if needed).
   *
   * @param frame - The frame.
   */
  private async send (frame: Frame): Promise<void> {
    await this.connect()
    this.socket.send(JSON.stringify(frame))
  }

  /**
   * Deliver an incoming raw payload to the local listeners.
   *
   * @param raw - The raw message data.
   */
  private deliver (raw: unknown): void {
    let message: RealtimeMessage
    try {
      message = JSON.parse(typeof raw === 'string' ? raw : String(raw)) as RealtimeMessage
    } catch {
      return
    }
    for (const listener of this.listeners.get(message.channel) ?? []) { void listener(message) }
    for (const listener of this.listeners.get(ALL_CHANNELS) ?? []) { void listener(message) }
  }

  /**
   * Resolve a WebSocket implementation and open the socket.
   *
   * @returns A promise that resolves on `open`.
   * @throws {RealtimeError} When no WebSocket implementation is available.
   */
  private async open (): Promise<void> {
    const WebSocketImpl = await this.resolveWebSocket()
    const socket = new WebSocketImpl(this.options.url, this.options.protocols)
    this.socket = socket

    const onMessage = (data: unknown): void => { this.deliver((data as { data?: unknown })?.data ?? data) }
    const onError = (): void => {}

    await new Promise<void>((resolve) => {
      if (typeof socket.on === 'function') {
        socket.on('open', () => resolve())
        socket.on('message', onMessage)
        socket.on('error', onError)
      } else {
        socket.onopen = () => resolve()
        socket.onmessage = onMessage
        socket.onerror = onError
      }
    })
  }

  /**
   * Resolve the WebSocket implementation: the explicit one, the global one, else lazy `ws`.
   *
   * @returns The WebSocket constructor.
   * @throws {RealtimeError} When none is available.
   */
  private async resolveWebSocket (): Promise<any> {
    if (this.options.WebSocket !== undefined && this.options.WebSocket !== null) { return this.options.WebSocket }
    if (typeof (globalThis as any).WebSocket !== 'undefined') { return (globalThis as any).WebSocket }
    return await import('ws').then(resolveModuleDefault).catch(() => {
      throw new RealtimeError('No WebSocket implementation available. On Node install "ws": npm i ws')
    })
  }
}
