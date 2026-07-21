import { RawResponseWrapper } from './RawResponseWrapper'
import { AdapterContext, IAdapterEventBuilder, RawResponseOptions } from '@stone-js/core'
import { IncomingHttpEvent, IncomingHttpEventOptions, OutgoingHttpResponse } from '@stone-js/http-core'

/**
 * The Azure Functions v4 HTTP request (`@azure/functions` `HttpRequest`).
 *
 * It is Web-standard (built on `undici`): `url` is absolute, `headers` is a `Headers`, and the body
 * is read once via `arrayBuffer()`. Duck-typed here to the members the normalizer uses, so the
 * adapter carries no `@azure/functions` runtime dependency.
 */
export interface AzureHttpRequest {
  /** The HTTP method. */
  method: string
  /** The absolute request URL. */
  url: string
  /** The request headers. */
  headers: Headers
  /** The request body stream, or `null` when there is none. */
  body?: ReadableStream<Uint8Array> | null
  /** Reads the body once as bytes. */
  arrayBuffer: () => Promise<ArrayBuffer>
  /** Extra Azure-specific members (query, params, user, …). */
  [key: string]: unknown
}

/**
 * The Azure Functions v4 HTTP response shape (`@azure/functions` `HttpResponseInit`).
 *
 * The handler returns this object; the Functions host turns it into the wire response. `headers`
 * accepts a `Headers` instance, which is how repeated `Set-Cookie` values are emitted correctly.
 */
export interface AzureHttpResponseInit {
  /** HTTP status code. */
  status?: number
  /** Response headers (a `Headers` instance to allow repeated `Set-Cookie`). */
  headers?: Headers | Record<string, string>
  /** Response body. */
  body?: BodyInit | null
  /** Extra Azure-specific members (jsonBody, cookies, …). */
  [key: string]: unknown
}

/**
 * The Azure Functions invocation context (`@azure/functions` `InvocationContext`).
 *
 * Opaque and optional, the adapter never depends on its shape; it carries the logger, invocation
 * id, trigger metadata, etc.
 */
export type AzureFunctionsHttpExecutionContext = Record<string, unknown>

/**
 * The options accumulated by the raw-response builder before an `HttpResponseInit` is produced.
 */
export interface AzureFunctionsHttpRawResponseOptions extends RawResponseOptions {
  /** HTTP status code. */
  status?: number
  /** HTTP status text. */
  statusText?: string
  /** Response headers. */
  headers?: Record<string, string>
  /** Response body. */
  body?: BodyInit | null
  /** `Set-Cookie` values (emitted as repeated headers). */
  cookies?: string[]
}

/**
 * The Azure Functions HTTP handler: `(request, invocationContext) => Promise<HttpResponseInit>`,
 * the signature `app.http('name', { handler })` expects from `@azure/functions` v4.
 */
export type AzureFunctionsHttpEventHandlerFunction = (
  request: AzureHttpRequest,
  executionContext?: AzureFunctionsHttpExecutionContext
) => Promise<AzureHttpResponseInit>

/**
 * The adapter context for the Azure Functions HTTP adapter.
 */
export type AzureFunctionsHttpAdapterContext = AdapterContext<
AzureHttpRequest,
AzureHttpResponseInit,
AzureFunctionsHttpExecutionContext,
IncomingHttpEvent,
IncomingHttpEventOptions,
OutgoingHttpResponse
>

/**
 * The raw-response builder for the Azure Functions HTTP adapter.
 */
export type AzureFunctionsHttpAdapterResponseBuilder = IAdapterEventBuilder<AzureFunctionsHttpRawResponseOptions, RawResponseWrapper>
