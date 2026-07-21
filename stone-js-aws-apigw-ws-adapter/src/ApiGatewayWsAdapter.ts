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
import { Connection, ConnectionStore, RealtimeManager, RealtimeRouter } from '@stone-js/realtime'

const OK: RawWsResponse = { statusCode: 200 }

/**
 * AWS API Gateway WebSocket adapter for Stone.js.
 *
 * API Gateway invokes a fresh Lambda per socket event, so this adapter maps `requestContext.eventType`
 * (`CONNECT` / `DISCONNECT` / `MESSAGE`) onto `@stone-js/realtime`: it maintains the shared connection
 * store (DynamoDB in production) and dispatches lifecycle, subscribe/unsubscribe and channel events
 * into the realtime router, firing `@On*` gateways. Replies to clients go through the API Gateway
 * Management API (see {@link ApiGatewayWsBroadcaster}); the management endpoint is taken from each
 * event. Data frames can also run through the kernel when `stone.adapter.dispatchToKernel` is set.
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
        await this.router()?.connect(connection)
        return OK
      case DISCONNECT:
        await this.store()?.remove(connection.id)
        await this.router()?.disconnect(connection)
        return OK
      case MESSAGE:
        return await this.handleMessage(event, context, connection)
      default:
        return OK
    }
  }

  /**
   * Handle a `MESSAGE` event: control frames update presence; data frames drive gateways and,
   * optionally, the kernel.
   *
   * @param event - The raw event.
   * @param context - The Lambda execution context.
   * @param connection - The connection.
   * @returns The raw response.
   */
  protected async handleMessage (event: ApiGatewayWsEvent, context: LambdaContext, connection: Connection): Promise<RawWsResponse> {
    const frame = parseFrame(event.body)

    if (frame === undefined) {
      await this.router()?.error(new ApiGatewayWsAdapterError('Malformed WebSocket frame.'), connection)
      return { statusCode: 400 }
    }

    if (frame.type === 'subscribe' && typeof frame.channel === 'string') {
      await this.store()?.subscribe(connection.id, frame.channel)
      await this.router()?.subscribe(frame.channel, connection)
      return OK
    }

    if (frame.type === 'unsubscribe' && typeof frame.channel === 'string') {
      await this.store()?.unsubscribe(connection.id, frame.channel)
      await this.router()?.unsubscribe(frame.channel, connection)
      return OK
    }

    await this.router()?.message(frame, connection)
    if (typeof frame.channel === 'string' && typeof frame.event === 'string') {
      await this.router()?.event(frame.channel, frame.event, frame.payload, connection)
    }

    if (this.blueprint.get<boolean>('stone.adapter.dispatchToKernel', false)) {
      return await this.dispatchToKernel(event, context)
    }

    return OK
  }

  /**
   * Run an event through the Stone.js kernel and return the raw ack response.
   *
   * @param event - The raw event.
   * @param context - The Lambda execution context.
   * @returns The raw response.
   */
  protected async dispatchToKernel (event: ApiGatewayWsEvent, context: LambdaContext): Promise<RawWsResponse> {
    const incomingEventBuilder = AdapterEventBuilder.create<IncomingEventOptions, IncomingEvent>({
      resolver: (options) => IncomingEvent.create(options)
    })

    const rawResponseBuilder = AdapterEventBuilder.create<RawResponseOptions, RawResponseWrapper>({
      resolver: (options) => RawResponseWrapper.create(options)
    })

    const adapterContext: ApiGatewayWsAdapterContext = {
      rawEvent: event,
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
   * The realtime router, if realtime is enabled.
   *
   * @returns The router, or `undefined`.
   */
  protected router (): RealtimeRouter | undefined {
    return RealtimeRouter.getInstance()
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
