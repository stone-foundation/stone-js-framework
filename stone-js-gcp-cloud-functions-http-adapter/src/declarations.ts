import { ServerResponseWrapper } from './ServerResponseWrapper'
import { IncomingMessage, ServerResponse } from 'node:http'
import { AdapterContext, IAdapterEventBuilder, RawResponseOptions } from '@stone-js/core'
import { IncomingHttpEvent, IncomingHttpEventOptions, OutgoingHttpResponse } from '@stone-js/http-core'

/**
 * The GCP Cloud Functions HTTP request object.
 *
 * The Functions Framework invokes an HTTP function with an Express-flavoured request that extends
 * Node's `IncomingMessage`. On top of the standard stream, it exposes the already-parsed `body` and
 * the untouched `rawBody` buffer (the framework consumes the request stream before the handler runs),
 * which is why the normalizer reads them instead of re-reading the drained socket.
 */
export type GcpHttpFunctionRequest = IncomingMessage & {
  /** The body parsed by the Functions Framework body-parser (JSON, urlencoded, text). */
  body?: unknown
  /** The untouched request payload captured by the framework (webhook signatures, multipart, etc.). */
  rawBody?: Buffer
}

/**
 * The GCP Cloud Functions HTTP response object.
 *
 * The Functions Framework passes an Express-flavoured response that extends Node's `ServerResponse`,
 * so the standard `ServerResponseWrapper` writes to it unchanged.
 */
export type GcpHttpFunctionResponse = ServerResponse & Record<string, any>

/**
 * The HTTP handler the Functions Framework registers and invokes per request.
 *
 * This is the value returned by `run()`: `functions.http('stone', await adapter.run())`.
 */
export type GcpHttpFunctionHandler = (
  request: GcpHttpFunctionRequest,
  response: GcpHttpFunctionResponse
) => Promise<ServerResponse>

/**
 * Extends the `AdapterContext` interface to provide additional properties for the GCP Cloud Functions HTTP adapter.
 *
 * This context includes the raw HTTP response (`ServerResponse`) in addition to the standard
 * Stone.js adapter context properties. There is no long-running execution context in the HTTP
 * function signature, so the `Context` type parameter is `undefined`.
 */
export interface GcpCloudFunctionsHttpAdapterContext extends AdapterContext<
IncomingMessage,
ServerResponse,
undefined,
IncomingHttpEvent,
IncomingHttpEventOptions,
OutgoingHttpResponse
> {
  /**
   * The raw HTTP response object associated with the current request.
   */
  rawResponse: ServerResponse
}

/**
 * Represents the response builder for the GCP Cloud Functions HTTP Adapter.
 */
export type GcpCloudFunctionsHttpAdapterResponseBuilder = IAdapterEventBuilder<RawHttpResponseOptions, ServerResponseWrapper>

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
  body: unknown

  /**
   * The character set used for encoding the response body. Defaults to `utf-8` if not specified.
   */
  charset?: string

  /**
   * The HTTP status code of the response (e.g., `200`, `404`).
   */
  statusCode: number

  /**
   * The status message accompanying the HTTP status code (e.g., `OK`, `Not Found`).
   */
  statusMessage: string

  /**
   * Headers to include in the HTTP response.
   * Can be provided as a `Map<string, string>` or `Headers` object.
   */
  headers: Map<string, string> | Headers

  /**
   * A function to stream a file as the HTTP response.
   * Can be synchronous or asynchronous.
   */
  streamFile: () => void | Promise<void>

  /**
   * A readable stream to pipe as the HTTP response body (streaming SSR, SSE, chunked APIs).
   * Accepts a Web `ReadableStream` (runtime-agnostic, e.g. from React `renderToReadableStream`)
   * or a Node `Readable`. When set, it takes precedence over `body`.
   */
  stream: ReadableStream<Uint8Array> | NodeJS.ReadableStream
}
