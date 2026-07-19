import { RawResponseWrapper } from './RawResponseWrapper'
import { AdapterContext, IAdapterEventBuilder, RawResponseOptions } from '@stone-js/core'
import { IncomingHttpEvent, IncomingHttpEventOptions, OutgoingHttpResponse } from '@stone-js/http-core'

/**
 * The runtime-provided execution context (e.g. Cloudflare `env`/`ctx`, Deno info). Opaque and
 * optional — the adapter never depends on any particular runtime's shape.
 */
export type FetchExecutionContext = Record<string, unknown>

/**
 * The options accumulated by the raw-response builder before a Web `Response` is produced.
 */
export interface FetchRawResponseOptions extends RawResponseOptions {
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
 * A Fetch handler function: `(request, executionContext?) => Promise<Response>` — exactly what
 * Cloudflare Workers, Deno, Bun, Vercel/Netlify Edge expect from `export default { fetch }`.
 */
export type FetchEventHandlerFunction = (request: Request, executionContext?: FetchExecutionContext) => Promise<Response>

/**
 * The adapter context for the Fetch adapter.
 */
export type FetchAdapterContext = AdapterContext<
Request,
Response,
FetchExecutionContext,
IncomingHttpEvent,
IncomingHttpEventOptions,
OutgoingHttpResponse
>

/**
 * The raw-response builder for the Fetch adapter.
 */
export type FetchAdapterResponseBuilder = IAdapterEventBuilder<FetchRawResponseOptions, RawResponseWrapper>
