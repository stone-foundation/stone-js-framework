import { isTextualContentType, NormalizedWebRequest, resolveIp as resolveIpFromHeaders } from '@stone-js/http-core'
import { AlibabaFcHttpRequest } from './declarations'

/**
 * A canonical HTTP request derived from an Alibaba FC HTTP request.
 *
 * The same shape every adapter produces, so it is the one `@stone-js/http-core` declares rather than
 * a fourth copy of the same seven fields. What is FC-specific is how the shape gets filled: FC hands
 * the handler a plain object whose headers are a record of strings or arrays and whose body is
 * already a `Buffer`, so there is no Web `Request` here to normalise.
 */
export type NormalizedRequest = NormalizedWebRequest

/** Header names carrying the client IP, in order of preference (FC front end sets x-forwarded-for). */
const IP_HEADERS = ['x-forwarded-for', 'x-real-ip', 'x-client-ip']

/**
 * Turns FC's plain header object into a lower-cased record, joining repeated values.
 *
 * @param headers - The FC request headers.
 * @returns A plain lower-cased record.
 */
export function headersToRecord (headers: Record<string, string | string[] | undefined>): Record<string, string> {
  const out: Record<string, string> = {}

  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined) { continue }
    out[key.toLowerCase()] = Array.isArray(value) ? value.join(', ') : value
  }

  return out
}

/**
 * Resolves the best-effort client IP: FC's `clientIP`, then forwarding headers.
 *
 * FC's own field comes first because the platform sets it, and a forwarding header is written by
 * whoever spoke last. The header fallback is the shared one, since reading a list of forwarded
 * headers is not an FC concern.
 *
 * @param clientIP - The FC-provided client IP, if any.
 * @param headers - The normalized headers.
 * @returns The client IP, or an empty string when unknown.
 */
export function resolveIp (clientIP: string | undefined, headers: Record<string, string>): string {
  if (typeof clientIP === 'string' && clientIP.length > 0) { return clientIP }

  return resolveIpFromHeaders(headers, IP_HEADERS)
}

/**
 * Reads the FC body buffer once, returning text for textual content types and bytes otherwise.
 *
 * @param body - The FC request body buffer.
 * @param contentType - The `content-type` header value.
 * @returns The raw body, or `undefined` when there is none.
 */
export function readRawBody (body: Buffer | undefined, contentType: string | undefined): string | Uint8Array | undefined {
  if (body === undefined || body === null || body.byteLength === 0) { return undefined }

  return isTextualContentType(contentType)
    ? body.toString('utf-8')
    : new Uint8Array(body)
}

/**
 * Resolves the absolute request URL from FC's path and the `host` header.
 *
 * @param request - The FC request.
 * @param headers - The normalized headers.
 * @returns The absolute URL.
 */
export function resolveUrl (request: AlibabaFcHttpRequest, headers: Record<string, string>): URL {
  const host = headers.host ?? headers['x-forwarded-host'] ?? 'localhost'
  const proto = headers['x-forwarded-proto'] ?? 'https'
  const path = request.url ?? request.path ?? '/'
  return new URL(path, `${proto}://${host}`)
}

/**
 * Normalises an Alibaba FC HTTP request into the canonical {@link NormalizedRequest}.
 *
 * @param request - The FC request.
 * @returns The normalized request.
 */
export function normalizeRequest (request: AlibabaFcHttpRequest): NormalizedRequest {
  const headers = headersToRecord(request.headers)
  const url = resolveUrl(request, headers)
  const cookieHeader = headers.cookie ?? ''

  return {
    url,
    headers,
    method: request.method.toUpperCase(),
    rawQueryString: url.search.startsWith('?') ? url.search.slice(1) : url.search,
    cookies: cookieHeader.length > 0 ? cookieHeader.split(/; */) : [],
    ip: resolveIp(request.clientIP, headers),
    rawBody: readRawBody(request.body, headers['content-type'])
  }
}
