import { TencentScfHttpEvent } from './declarations'

/**
 * Platform-agnostic normalization of the Tencent Cloud SCF HTTP (API Gateway) event.
 *
 * Tencent SCF exposes HTTP through API Gateway's proxy integration, which delivers a single event
 * shape: `httpMethod`, `path`, `headers`, `queryString` (an object), a string `body` with
 * `isBase64Encoded`, and `requestContext.sourceIp`. This module reduces it to one canonical
 * {@link NormalizedHttpEvent} so the rest of the adapter never touches the raw event.
 */

/**
 * A canonical HTTP request derived from a Tencent SCF API Gateway event.
 */
export interface NormalizedHttpEvent {
  /** The HTTP method (upper-case). */
  method: string
  /** The request path (no query string). */
  path: string
  /** The raw query string (without leading `?`). */
  rawQueryString: string
  /** Lower-cased headers; multi-value headers joined with `, `. */
  headers: Record<string, string>
  /** Raw cookie strings (e.g. `['a=1', 'b=2']`). */
  cookies: string[]
  /** The best-effort client source IP. */
  sourceIp: string
  /** Whether {@link body} is base64-encoded. */
  isBase64Encoded: boolean
  /** The raw request body as delivered by SCF (string or undefined). */
  body?: string
}

/**
 * Normalize headers to lower-cased keys, merging single and multi-value headers.
 *
 * @param event - The raw SCF event.
 * @returns Lower-cased headers with multi-value entries joined by `, `.
 */
export function normalizeHeaders (event: TencentScfHttpEvent): Record<string, string> {
  const out: Record<string, string> = {}

  const multi = event.multiValueHeaders
  if (multi !== null && multi !== undefined) {
    for (const [name, values] of Object.entries(multi)) {
      if (Array.isArray(values)) { out[name.toLowerCase()] = values.join(', ') }
    }
  }

  const single = event.headers
  if (single !== null && single !== undefined) {
    for (const [name, value] of Object.entries(single)) {
      if (value !== undefined) { out[name.toLowerCase()] = value }
    }
  }

  return out
}

/**
 * Build the raw query string from whichever representation SCF provides.
 *
 * Tencent API Gateway sends `queryString` (an object, values string or string[]). Some integrations
 * additionally send `queryStringParameters` / `multiValueQueryStringParameters`. Values are
 * URL-encoded so repeated/array values survive.
 *
 * @param event - The raw SCF event.
 * @returns The raw query string (no leading `?`).
 */
export function buildRawQueryString (event: TencentScfHttpEvent): string {
  const multi = event.multiValueQueryStringParameters
  if (multi !== null && multi !== undefined) {
    const params = new URLSearchParams()
    for (const [key, values] of Object.entries(multi)) {
      for (const value of values ?? []) { params.append(key, value) }
    }
    return params.toString()
  }

  const single = event.queryString ?? event.queryStringParameters
  if (single !== null && single !== undefined) {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(single)) {
      if (Array.isArray(value)) {
        for (const item of value) { params.append(key, item) }
      } else if (value !== undefined) {
        params.append(key, value)
      }
    }
    return params.toString()
  }

  return ''
}

/**
 * Collect the raw cookie strings from the `Cookie` header.
 *
 * @param headers - The normalized headers.
 * @returns The raw cookie strings.
 */
export function collectCookies (headers: Record<string, string>): string[] {
  const header = headers.cookie
  return typeof header === 'string' && header.length > 0 ? header.split(/; */) : []
}

/**
 * Resolve the client source IP: `requestContext.sourceIp`, then the first `X-Forwarded-For` hop.
 *
 * @param event - The raw SCF event.
 * @param headers - The normalized headers.
 * @returns The source IP (empty string if unknown).
 */
export function resolveSourceIp (event: TencentScfHttpEvent, headers: Record<string, string>): string {
  const requestContext = event.requestContext
  if (typeof requestContext?.sourceIp === 'string' && requestContext.sourceIp.length > 0) {
    return requestContext.sourceIp
  }
  return (headers['x-forwarded-for'] ?? '').split(',')[0].trim()
}

/**
 * Normalize the Tencent SCF HTTP event into the canonical {@link NormalizedHttpEvent}.
 *
 * @param event - The raw SCF event.
 * @returns The normalized request.
 */
export function normalizeHttpEvent (event: TencentScfHttpEvent): NormalizedHttpEvent {
  const headers = normalizeHeaders(event)

  const method = String(event.httpMethod ?? event.requestContext?.httpMethod ?? 'GET').toUpperCase()
  const path = String(event.path ?? '/')

  return {
    method,
    path,
    headers,
    rawQueryString: buildRawQueryString(event),
    cookies: collectCookies(headers),
    sourceIp: resolveSourceIp(event, headers),
    isBase64Encoded: event.isBase64Encoded === true,
    body: typeof event.body === 'string' ? event.body : undefined
  }
}

/**
 * Extract the raw request body exactly as received, decoding base64 to a Buffer when needed.
 *
 * This is what the adapter exposes as `metadata.rawBody`: the untouched payload the client sent,
 * available even when no body-parsing middleware is installed. Binary payloads are returned as a
 * `Buffer` (never a lossy UTF-8 round-trip); text payloads as a string. A non-string, non-base64
 * body (e.g. a pre-parsed object from a test/custom integration) is returned as-is.
 *
 * @param event - The raw SCF event.
 * @returns The raw body as a Buffer, string, the original value, or undefined.
 */
export function getRawBody (event: TencentScfHttpEvent): Buffer | string | unknown {
  if (typeof event.body === 'string') {
    return event.isBase64Encoded === true ? Buffer.from(event.body, 'base64') : event.body
  }
  return event.body
}
