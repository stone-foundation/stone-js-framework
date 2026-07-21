import {
  Adapter,
  IBlueprint,
  IncomingEvent,
  OutgoingResponse,
  RawResponseOptions,
  AdapterEventBuilder,
  IncomingEventOptions,
  AdapterEventHandlerType
} from '@stone-js/core'
import {
  RawWsResponse,
  LambdaContext,
  ApiGatewayWsEvent,
  ApiGatewayWsAdapterContext,
  ApiGatewayWsHandlerFunction
} from './declarations'
import { parseFrame, managementEndpoint } from './utils'
import { RawResponseWrapper } from './RawResponseWrapper'
import { CONNECT, DISCONNECT, MESSAGE } from './constants'
import { ApiGatewayWsAdapterError } from './errors/ApiGatewayWsAdapterError'
import {
  Connection,
  ConnectionStore,
  RealtimeManager,
  eventKey,
  CONNECT as KEY_CONNECT,
  DISCONNECT as KEY_DISCONNECT,
  MESSAGE as KEY_MESSAGE,
  ERROR as KEY_ERROR,
  SUBSCRIBE as KEY_SUBSCRIBE,
  UNSUBSCRIBE as KEY_UNSUBSCRIBE
} from '@stone-js/realtime'

const OK: RawWsResponse = { statusCode: 200 }

/**
 * AWS API Gateway WebSocket adapter for Stone.js.
 *
 * API Gateway invokes a fresh Lambda per socket event, so this adapter maps `requestContext.eventType`
 * (`CONNECT` / `DISCONNECT` / `MESSAGE`) into a keyed `IncomingEvent` and runs it through the kernel,
 * where the light key-router from `@stone-js/router` routes it to the matching `@On*` gateway method,
 * the same pattern as every adapter. It maintains the shared connection store (DynamoDB in production);
 * replies to clients go through the API Gateway Management API (see {@link ApiGatewayWsBroadcaster}),
 * the management endpoint taken from each event.
 */
export class ApiGatewayWsAdapter extends Adapter<
ApiGatewayWsEvent,
RawWsResponse,
LambdaContext,
IncomingEvent,
IncomingEventOptions,
OutgoingResponse,
ApiGatewayWsAdapterContext
> {
  private resolvedStore?: ConnectionStore

  /**
   * Create an ApiGatewayWsAdapter.
   *
   * @param blueprint - The application blueprint.
   * @returns A new instance.
   */
  static create (blueprint: IBlueprint): ApiGatewayWsAdapter {
    return new this(blueprint)
  }

  /**
   * Initialize and return the Lambda handler API Gateway invokes.
   *
   * @returns The handler.
   */
  public async run<ExecutionResultType = ApiGatewayWsHandlerFunction>(): Promise<ExecutionResultType> {
    await this.onStart()
    const handler = async (event: ApiGatewayWsEvent, context: LambdaContext): Promise<RawWsResponse> => {
      return await this.eventListener(event, context)
    }
    return handler as ExecutionResultType
  }

  /**
   * Validate the runtime context and run the start hooks.
   *
   * @throws {ApiGatewayWsAdapterError} When used outside a Node.js/Lambda context.
   */
  protected async onStart (): Promise<void> {
    if (typeof window === 'object') {
      throw new ApiGatewayWsAdapterError('This `ApiGatewayWsAdapter` must be used only in an AWS Lambda context.')
    }
    await this.executeHooks('onStart')
  }

  /**
   * Route one API Gateway WebSocket event by its lifecycle type.
   *
   * @param event - The raw event.
   * @param context - The Lambda execution context.
   * @returns The raw response (an ack for API Gateway).
   */
  protected async eventListener (event: ApiGatewayWsEvent, context: LambdaContext): Promise<RawWsResponse> {
    this.useEndpoint(event)

    const connection: Connection = { id: event.requestContext.connectionId }

    switch (event.requestContext.eventType) {
      case CONNECT:
        await this.store()?.add(connection)
        await this.dispatch(context, connection, KEY_CONNECT)
        return OK
      case DISCONNECT:
        await this.store()?.remove(connection.id)
        await this.dispatch(context, connection, KEY_DISCONNECT)
        return OK
      case MESSAGE:
        return await this.handleMessage(event, context, connection)
      default:
        return OK
    }
  }

  /**
   * Handle a `MESSAGE` event: control frames update presence; every frame is routed through the kernel.
   *
   * @param event - The raw event.
   * @param context - The Lambda execution context.
   * @param connection - The connection.
   * @returns The raw response.
   */
  protected async handleMessage (event: ApiGatewayWsEvent, context: LambdaContext, connection: Connection): Promise<RawWsResponse> {
    const frame = parseFrame(event.body)

    if (frame === undefined) {
      await this.dispatch(context, connection, KEY_ERROR, new ApiGatewayWsAdapterError('Malformed WebSocket frame.'))
      return { statusCode: 400 }
    }

    if (frame.type === 'subscribe' && typeof frame.channel === 'string') {
      await this.store()?.subscribe(connection.id, frame.channel)
      await this.dispatch(context, connection, KEY_SUBSCRIBE, frame.channel)
      return OK
    }

    if (frame.type === 'unsubscribe' && typeof frame.channel === 'string') {
      await this.store()?.unsubscribe(connection.id, frame.channel)
      await this.dispatch(context, connection, KEY_UNSUBSCRIBE, frame.channel)
      return OK
    }

    await this.dispatch(context, connection, KEY_MESSAGE, frame)
    if (typeof frame.channel === 'string' && typeof frame.event === 'string') {
      await this.dispatch(context, connection, eventKey(frame.channel, frame.event), frame.payload)
    }

    return OK
  }

  /**
   * Normalize a socket event into an `IncomingEvent` and route it through the kernel.
   *
   * @param context - The Lambda execution context.
   * @param connection - The connection.
   * @param key - The routing key (a lifecycle key or `event:<channel>:<event>`).
   * @param payload - The payload carried to the handler.
   * @returns The raw response.
   */
  protected async dispatch (context: LambdaContext, connection: Connection, key: string, payload?: unknown): Promise<RawWsResponse> {
    const incomingEventBuilder = AdapterEventBuilder.create<IncomingEventOptions, IncomingEvent>({
      resolver: (options) => IncomingEvent.create(options)
    })

    const rawResponseBuilder = AdapterEventBuilder.create<RawResponseOptions, RawResponseWrapper>({
      resolver: (options) => RawResponseWrapper.create(options)
    })

    const adapterContext: ApiGatewayWsAdapterContext = {
      // The kernel event is normalized to a keyed routing event (not the raw API Gateway event);
      // the light router reads the key from `detail-type` and the payload from `detail`.
      rawEvent: { 'detail-type': key, detail: payload, connection } as unknown as ApiGatewayWsEvent,
      rawResponse: {},
      rawResponseBuilder,
      incomingEventBuilder,
      executionContext: context
    }

    let eventHandler: AdapterEventHandlerType<IncomingEvent, OutgoingResponse> | undefined

    try {
      eventHandler = this.resolveEventHandler()
      await this.executeEventHandlerHooks('onInit', eventHandler)
      return await this.sendEventThroughDestination(adapterContext, eventHandler)
    } catch (error: any) {
      const builder = await this.handleError(error, adapterContext)
      return await this.buildRawResponse({ ...adapterContext, rawResponseBuilder: builder }, eventHandler)
    }
  }

  /**
   * Point the broadcaster at this event's management endpoint (when it supports it).
   *
   * @param event - The raw event.
   */
  protected useEndpoint (event: ApiGatewayWsEvent): void {
    const endpoint = managementEndpoint(event)
    const broadcaster = RealtimeManager.getInstance()?.connection() as { useEndpoint?: (endpoint: string) => void } | undefined
    if (endpoint !== undefined && typeof broadcaster?.useEndpoint === 'function') {
      broadcaster.useEndpoint(endpoint)
    }
  }

  /**
   * The shared connection store the broadcaster reads, if realtime is enabled.
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
}
