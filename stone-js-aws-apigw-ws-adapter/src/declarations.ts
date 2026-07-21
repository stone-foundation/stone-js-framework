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
 * The API Gateway WebSocket request context (the fields the adapter reads).
 */
export interface ApiGatewayWsRequestContext {
  /** The stable connection id for the socket. */
  connectionId: string
  /** The lifecycle event type: `CONNECT`, `DISCONNECT` or `MESSAGE`. */
  eventType: string
  /** The route key (`$connect`, `$disconnect`, `$default`, or a custom route). */
  routeKey?: string
  /** The API domain name (used to build the management endpoint). */
  domainName?: string
  /** The API stage (used to build the management endpoint). */
  stage?: string
  /** Other request-context fields. */
  [key: string]: unknown
}

/**
 * The raw API Gateway WebSocket Lambda event.
 */
export interface ApiGatewayWsEvent {
  /** The request context carrying the connection id and event type. */
  requestContext: ApiGatewayWsRequestContext
  /** The message body (for `MESSAGE` events). */
  body?: string
  /** Other event fields. */
  [key: string]: unknown
}

/** The AWS Lambda execution context. */
export type LambdaContext = Record<string, unknown>

/** The raw response returned to API Gateway (`{ statusCode }`). */
export type RawWsResponse = Record<string, unknown>

/**
 * The Lambda handler function API Gateway invokes.
 */
export type ApiGatewayWsHandlerFunction<RawResponseType = RawWsResponse> = (
  event: ApiGatewayWsEvent,
  context: LambdaContext
) => Promise<RawResponseType>

/**
 * The wire frame exchanged with clients (matching the `@stone-js/realtime` client protocol).
 */
export interface WsFrame {
  /** The frame kind (`event`, `subscribe`, `unsubscribe`); absent frames are data. */
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
 * A minimal API Gateway Management client: posts a message back to a connection.
 */
export interface ManagementClient {
  /** Post data to a connection; a stale (410 Gone) connection resolves without throwing. */
  postToConnection: (connectionId: string, data: string) => Promise<void>
}

/**
 * A factory that builds a {@link ManagementClient} for a management endpoint (injectable in tests).
 */
export type ManagementClientFactory = (endpoint: string) => ManagementClient

/**
 * Options for the {@link ApiGatewayManagementClient}.
 */
export interface ManagementClientOptions {
  /** The management endpoint (`https://<domain>/<stage>`). */
  endpoint: string
  /** An existing `ApiGatewayManagementApiClient` to reuse. */
  client?: unknown
}

/**
 * A DynamoDB document client, duck-typed over `@aws-sdk/lib-dynamodb` `DynamoDBDocument`.
 */
export interface DynamoDocumentClient {
  put: (params: Record<string, unknown>) => Promise<unknown>
  delete: (params: Record<string, unknown>) => Promise<unknown>
  query: (params: Record<string, unknown>) => Promise<{ Items?: Array<Record<string, unknown>> }>
}

/**
 * Options for the {@link DynamoDbConnectionStore}.
 */
export interface DynamoStoreOptions {
  /** The DynamoDB table name (defaults to `stone_ws_connections`). */
  table?: string
  /** An existing `DynamoDBDocument` client to reuse. */
  client?: DynamoDocumentClient
  /** The AWS region (passed to the DynamoDB client when none is provided). */
  region?: string
}

/** The response builder for the adapter. */
export type ApiGatewayWsResponseBuilder = IAdapterEventBuilder<RawResponseOptions, RawResponseWrapper>

/**
 * The adapter context for the API Gateway WebSocket adapter.
 */
export interface ApiGatewayWsAdapterContext extends AdapterContext<
ApiGatewayWsEvent,
RawWsResponse,
LambdaContext,
IncomingEvent,
IncomingEventOptions,
OutgoingResponse
> {
  /** The raw response associated with the current context. */
  rawResponse: RawWsResponse
}
