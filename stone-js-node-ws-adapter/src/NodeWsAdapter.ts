import {
  Adapter,
  ILogger,
  IBlueprint,
  IncomingEvent,
  LoggerResolver,
  OutgoingResponse,
  RawResponseOptions,
  AdapterEventBuilder,
  IncomingEventOptions,
  defaultLoggerResolver,
  AdapterEventHandlerType
} from '@stone-js/core'
import {
  WsServer,
  WsSocket,
  RawWsEvent,
  RawWsResponse,
  WsServerFactory,
  NodeWsExecutionContext,
  NodeWsAdapterContext
} from './declarations'
import { parseFrame, resolveWebSocketServer } from './utils'
import { RawResponseWrapper } from './RawResponseWrapper'
import { NodeWsAdapterError } from './errors/NodeWsAdapterError'
import { Connection, ConnectionStore, RealtimeManager, RealtimeRouter } from '@stone-js/realtime'

/**
 * Node.js WebSocket adapter for Stone.js.
 *
 * Runs a `ws` server and bridges sockets to `@stone-js/realtime`: each accepted socket becomes a
 * {@link Connection} added to the shared connection store (so `broadcast` reaches it) and its
 * lifecycle (connect, subscribe, unsubscribe, message, error, disconnect) is dispatched into the
 * realtime router (so `@On*` gateways fire). Data frames are additionally run through the Stone.js
 * kernel when `stone.adapter.dispatchToKernel` is enabled, so apps can answer a frame with a route.
 *
 * `ws` is an optional peer dependency, imported lazily. The core is never touched: this adapter is
 * pure Integration, normalizing socket causes into intentions.
 */
export class NodeWsAdapter extends Adapter<
RawWsEvent,
RawWsResponse,
NodeWsExecutionContext,
IncomingEvent,
IncomingEventOptions,
OutgoingResponse,
NodeWsAdapterContext
> {
  protected readonly url: URL
  protected readonly logger: ILogger
  protected server?: WsServer
  private connectionSeq: number = 0
  private resolvedStore?: ConnectionStore

  /**
   * Create a NodeWsAdapter.
   *
   * @param blueprint - The application blueprint.
   * @returns A new instance.
   */
  static create (blueprint: IBlueprint): NodeWsAdapter {
    return new this(blueprint)
  }

  /**
   * @param blueprint - The application blueprint.
   */
  protected constructor (blueprint: IBlueprint) {
    super(blueprint)
    this.url = new URL(blueprint.get('stone.adapter.url', 'ws://localhost:8080'))
    this.logger = blueprint.get<LoggerResolver>('stone.logger.resolver', defaultLoggerResolver)(blueprint)
  }

  /**
   * Start the WebSocket server and wire connection handling.
   *
   * @returns The running server.
   */
  public async run<ExecutionResultType = WsServer>(): Promise<ExecutionResultType> {
    await this.onStart()

    const server = await this.createServer()
    this.server = server

    server.on('connection', (socket: WsSocket) => { this.handleConnection(socket) })
    server.on('error', (error: Error) => { this.logger.error(error.message, { error }) })

    return server as ExecutionResultType
  }

  /**
   * Stop the server and run the stop hooks.
   */
  public async stop (): Promise<void> {
    await this.executeHooks('onStop')
    await new Promise<void>((resolve) => {
      if (this.server === undefined) { resolve(); return }
      this.server.close(() => resolve())
    })
  }

  /**
   * Validate the runtime context and run the start hooks.
   *
   * @throws {NodeWsAdapterError} When used outside a Node.js context.
   */
  protected async onStart (): Promise<void> {
    if (typeof window === 'object') {
      throw new NodeWsAdapterError('This `NodeWsAdapter` must be used only in a Node.js context.')
    }
    await this.executeHooks('onStart')
  }

  /**
   * Create the `ws` server, honouring an injected factory (tests / custom transports).
   *
   * @returns The server.
   * @throws {NodeWsAdapterError} When `ws` is not installed.
   */
  protected async createServer (): Promise<WsServer> {
    const options = this.blueprint.get<Record<string, unknown>>('stone.adapter.server', {})
    const factory = this.blueprint.get<WsServerFactory | undefined>('stone.adapter.serverFactory', undefined)

    if (typeof factory === 'function') {
      return factory({ port: this.resolvePort(), host: this.url.hostname, ...options })
    }

    const WebSocketServer = await import('ws').then(resolveWebSocketServer).catch(() => {
      throw new NodeWsAdapterError('The Node WebSocket adapter requires "ws". Install it: npm i ws')
    })

    return new WebSocketServer({ port: this.resolvePort(), host: this.url.hostname, ...options }) as WsServer
  }

  /**
   * Handle a newly accepted socket: register the connection and wire its events.
   *
   * @param socket - The accepted socket.
   */
  protected handleConnection (socket: WsSocket): void {
    const connection: Connection = {
      id: `conn_${++this.connectionSeq}`,
      send: (message) => { socket.send(JSON.stringify(message)) }
    }

    void this.store()?.add(connection)
    void this.router()?.connect(connection)

    socket.on('message', (data: unknown) => { void this.handleMessage(socket, connection, data) })
    socket.on('close', () => { void this.handleClose(connection) })
    socket.on('error', (error: Error) => { void this.router()?.error(error, connection) })
  }

  /**
   * Handle an inbound frame: control frames update presence; data frames drive gateways and,
   * optionally, the kernel.
   *
   * @param socket - The originating socket.
   * @param connection - The connection.
   * @param data - The raw payload.
   */
  protected async handleMessage (socket: WsSocket, connection: Connection, data: unknown): Promise<void> {
    const frame = parseFrame(data)

    if (frame === undefined) {
      await this.router()?.error(new NodeWsAdapterError('Malformed WebSocket frame.'), connection)
      return
    }

    if (frame.type === 'subscribe' && typeof frame.channel === 'string') {
      await this.store()?.subscribe(connection.id, frame.channel)
      await this.router()?.subscribe(frame.channel, connection)
      return
    }

    if (frame.type === 'unsubscribe' && typeof frame.channel === 'string') {
      await this.store()?.unsubscribe(connection.id, frame.channel)
      await this.router()?.unsubscribe(frame.channel, connection)
      return
    }

    await this.router()?.message(frame, connection)
    if (typeof frame.channel === 'string' && typeof frame.event === 'string') {
      await this.router()?.event(frame.channel, frame.event, frame.payload, connection)
    }

    if (this.blueprint.get<boolean>('stone.adapter.dispatchToKernel', false)) {
      const response = await this.dispatchToKernel(frame, socket, connection)
      this.sendResponse(socket, response)
    }
  }

  /**
   * Handle a closed socket: drop the connection and notify gateways.
   *
   * @param connection - The connection.
   */
  protected async handleClose (connection: Connection): Promise<void> {
    await this.store()?.remove(connection.id)
    await this.router()?.disconnect(connection)
  }

  /**
   * Run a data frame through the Stone.js kernel and return the raw response.
   *
   * @param frame - The data frame.
   * @param socket - The originating socket.
   * @param connection - The connection.
   * @returns The raw response.
   */
  protected async dispatchToKernel (frame: RawWsEvent, socket: WsSocket, connection: Connection): Promise<RawWsResponse> {
    const incomingEventBuilder = AdapterEventBuilder.create<IncomingEventOptions, IncomingEvent>({
      resolver: (options) => IncomingEvent.create(options)
    })

    const rawResponseBuilder = AdapterEventBuilder.create<RawResponseOptions, RawResponseWrapper>({
      resolver: (options) => RawResponseWrapper.create(options)
    })

    const context: NodeWsAdapterContext = {
      rawEvent: frame,
      rawResponse: {},
      rawResponseBuilder,
      incomingEventBuilder,
      executionContext: { server: this.server as WsServer, socket, connectionId: connection.id }
    }

    let eventHandler: AdapterEventHandlerType<IncomingEvent, OutgoingResponse> | undefined

    try {
      eventHandler = this.resolveEventHandler()
      await this.executeEventHandlerHooks('onInit', eventHandler)
      return await this.sendEventThroughDestination(context, eventHandler)
    } catch (error: any) {
      const builder = await this.handleError(error, context)
      return await this.buildRawResponse({ ...context, rawResponseBuilder: builder }, eventHandler)
    }
  }

  /**
   * Send a kernel response back to the originating socket when it carries content.
   *
   * @param socket - The socket.
   * @param response - The raw response.
   */
  protected sendResponse (socket: WsSocket, response: RawWsResponse): void {
    if (response?.content !== undefined) {
      socket.send(JSON.stringify(response.content))
    }
  }

  /**
   * The realtime router, if realtime is enabled (else `undefined`, and gateways simply do not fire).
   *
   * @returns The router, or `undefined`.
   */
  protected router (): RealtimeRouter | undefined {
    return RealtimeRouter.getInstance()
  }

  /**
   * The shared connection store the default broadcaster reads, if realtime is enabled.
   *
   * @returns The store, or `undefined`.
   */
  protected store (): ConnectionStore | undefined {
    if (this.resolvedStore !== undefined) { return this.resolvedStore }
    const manager = RealtimeManager.getInstance()
    if (manager === undefined) { return undefined }
    this.resolvedStore = (manager.connection() as { store?: ConnectionStore }).store
    return this.resolvedStore
  }

  /**
   * Resolve the listen port from the configured URL (defaults to 8080).
   *
   * @returns The port.
   */
  protected resolvePort (): number {
    return this.url.port !== '' ? Number(this.url.port) : 8080
  }
}
