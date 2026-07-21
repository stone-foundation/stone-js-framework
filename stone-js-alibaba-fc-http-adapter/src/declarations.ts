import { RawResponseWrapper } from './RawResponseWrapper'
import { AdapterContext, IAdapterEventBuilder, RawResponseOptions } from '@stone-js/core'
import { IncomingHttpEvent, IncomingHttpEventOptions, OutgoingHttpResponse } from '@stone-js/http-core'

/**
 * The Alibaba Cloud Function Compute HTTP request (FC 2.0 `(req, resp, context)` model).
 *
 * FC reads the body for you and hands the handler a plain request object (not a Node stream): the
 * path, method, headers, the client IP, and the body as a `Buffer`. Duck-typed here to the members
 * the normalizer uses, so the adapter carries no Alibaba SDK runtime dependency.
 */
export interface AlibabaFcHttpRequest {
  /** The HTTP method. */
  method: string
  /** The request path with query string (e.g. `/tasks?done=1`). */
  url?: string
  /** The request path without query string. */
  path?: string
  /** The parsed query parameters. */
  queries?: Record<string, string | string[]>
  /** The request headers (plain object). */
  headers: Record<string, string | string[] | undefined>
  /** The client IP resolved by the FC HTTP trigger. */
  clientIP?: string
  /** The request body, pre-read by FC. */
  body?: Buffer
  /** Extra FC-specific members. */
  [key: string]: unknown
}

/**
 * The Alibaba Cloud Function Compute HTTP response (FC 2.0 imperative response object).
 *
 * Unlike a Web `Response`, the FC response is written imperatively: set the status and headers, then
 * `send()` the body once. Duck-typed to the methods the wrapper calls.
 */
export interface AlibabaFcHttpResponse {
  /** Sets the HTTP status code. */
  setStatusCode: (statusCode: number) => void
  /** Sets a response header (FC accepts an array for multi-value headers like `Set-Cookie`). */
  setHeader: (key: string, value: string | string[]) => void
  /** Removes a response header. */
  deleteHeader?: (key: string) => void
  /** Writes the body and completes the response. */
  send: (body?: string | Buffer) => void
  /** Extra FC-specific members. */
  [key: string]: unknown
}

/**
 * The FC invocation context (`context` argument). Opaque and optional; carries `requestId`,
 * `credentials`, `function`, `service`, logger, etc.
 */
export type AlibabaFcHttpExecutionContext = Record<string, unknown>

/**
 * The options accumulated by the raw-response builder before the FC response is written.
 */
export interface AlibabaFcHttpRawResponseOptions extends RawResponseOptions {
  /** HTTP status code. */
  status?: number
  /** HTTP status text. */
  statusText?: string
  /** Response headers. */
  headers?: Record<string, string>
  /** Response body. */
  body?: string | Buffer | null
  /** `Set-Cookie` values (emitted as repeated `set-cookie` headers). */
  cookies?: string[]
}

/**
 * The FC HTTP handler: `(req, resp, context) => Promise<void>`, the signature the FC 2.0 HTTP
 * trigger invokes. The response is written onto `resp`; the handler resolves once it is sent.
 */
export type AlibabaFcHttpEventHandlerFunction = (
  request: AlibabaFcHttpRequest,
  response: AlibabaFcHttpResponse,
  executionContext?: AlibabaFcHttpExecutionContext
) => Promise<void>

/**
 * The adapter context for the Alibaba FC HTTP adapter.
 *
 * Carries the imperative FC response as `rawResponse` (in addition to the standard properties).
 */
export interface AlibabaFcHttpAdapterContext extends AdapterContext<
AlibabaFcHttpRequest,
AlibabaFcHttpResponse,
AlibabaFcHttpExecutionContext,
IncomingHttpEvent,
IncomingHttpEventOptions,
OutgoingHttpResponse
> {
  /** The imperative FC response object for the current request. */
  rawResponse: AlibabaFcHttpResponse
}

/**
 * The raw-response builder for the Alibaba FC HTTP adapter.
 */
export type AlibabaFcHttpAdapterResponseBuilder = IAdapterEventBuilder<AlibabaFcHttpRawResponseOptions, RawResponseWrapper>
