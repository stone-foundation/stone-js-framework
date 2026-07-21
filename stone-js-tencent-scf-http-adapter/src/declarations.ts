import { RawHttpResponseWrapper } from './RawHttpResponseWrapper'
import { AdapterContext, IAdapterEventBuilder, RawResponseOptions } from '@stone-js/core'
import { IncomingHttpEvent, IncomingHttpEventOptions, OutgoingHttpResponse } from '@stone-js/http-core'

/**
 * Represents a raw HTTP response, extending from `RawHttpResponseOptions`.
 */
export type RawHttpResponse = RawHttpResponseOptions

/**
 * Represents the Tencent SCF execution context as a key-value pair.
 */
export type TencentScfContext = Record<string, unknown>

/**
 * Represents an Tencent SCF event handler function.
 *
 * @template RawResponseType - The type of the response returned by the handler.
 * @param rawEvent - The raw event received by the Tencent SCF function.
 * @param context - The Tencent SCF execution context.
 * @returns A promise resolving to the response of type `RawResponseType`.
 */
export type TencentScfEventHandlerFunction<RawResponseType = RawHttpResponse> = (
  rawEvent: TencentScfHttpEvent,
  context: TencentScfContext
) => Promise<RawResponseType>

/**
 * Represents the response builder for the Tencent SCF http Adapter.
 */
export type TencentScfHttpAdapterResponseBuilder = IAdapterEventBuilder<RawHttpResponseOptions, RawHttpResponseWrapper>

/**
 * Represents the Tencent Cloud SCF HTTP event (API Gateway proxy integration).
 *
 * SCF fronts HTTP with API Gateway, which delivers a single proxy event shape. Every field is
 * optional because a given request may omit some; use {@link normalizeHttpEvent} to reduce it to a
 * canonical shape.
 */
export interface TencentScfHttpEvent extends Record<string, unknown> {
  /** The path of the HTTP request. */
  path?: string

  /** The HTTP method of the request. */
  httpMethod?: string

  /** The body of the HTTP request (string, possibly base64-encoded). */
  body?: unknown

  /** Indicates whether the request body is base64-encoded. */
  isBase64Encoded?: boolean

  /** The headers of the HTTP request as key-value pairs (may be null/absent). */
  headers?: Record<string, string> | null

  /** Multi-value headers, when the gateway is configured to emit them. */
  multiValueHeaders?: Record<string, string[]>

  /** The query parameters, as delivered by API Gateway (values string or string[]). */
  queryString?: Record<string, string | string[]> | null

  /** Alternative single-value query parameters some integrations send. */
  queryStringParameters?: Record<string, string | string[]> | null

  /** Multi-value query parameters, when enabled. */
  multiValueQueryStringParameters?: Record<string, string[]>

  /** The API Gateway request context. */
  requestContext?: {
    /** The client source IP. */
    sourceIp?: string
    /** The HTTP method, when carried on the context rather than the top level. */
    httpMethod?: string
  }
}

/**
 * Represents the context for the Tencent SCF HTTP Adapter.
 *
 * This interface extends `AdapterContext` and includes additional properties specific
 * to HTTP events in Tencent SCF.
 */
export interface TencentScfHttpAdapterContext extends AdapterContext<
TencentScfHttpEvent,
RawHttpResponse,
TencentScfContext,
IncomingHttpEvent,
IncomingHttpEventOptions,
OutgoingHttpResponse
> {
  /**
   * The raw HTTP response associated with the current context.
   */
  rawResponse: RawHttpResponse
}

/**
 * Represents options for configuring a raw HTTP response.
 *
 * Extends the `RawResponseOptions` interface to include additional properties
 * for managing response content, headers, status codes, and streaming files.
 */
export interface RawHttpResponseOptions extends RawResponseOptions {
  /**
   * The body of the HTTP response. Can be of any type, including strings, objects, or buffers.
   */
  body?: unknown

  /**
   * The HTTP status code of the response (e.g., `200`, `404`).
   */
  statusCode: number

  /**
   * The status message accompanying the HTTP status code (e.g., `OK`, `Not Found`).
   */
  statusMessage?: string

  /**
   * Headers to include in the HTTP response. May be a `Headers` instance (from http-core) or a
   * plain record; the wrapper normalizes it and lifts out `Set-Cookie`.
   */
  headers?: Headers | Record<string, string>

  /**
   * Multi-value response headers, used by API Gateway to emit multiple `Set-Cookie`.
   */
  multiValueHeaders?: Record<string, string[]>

  /**
   * The encoding format of the response body, such as `base64`.
   */
  isBase64Encoded?: boolean
}
