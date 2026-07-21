import { AlibabaFcHttpRequest } from './declarations'

/**
 * A canonical HTTP request derived from an Alibaba FC HTTP request.
 *
 * FC hands the handler a plain request object with the body already read into a `Buffer`, so
 * normalisation lifts headers/cookies/ip/body into a plain, agnostic shape the rest of the adapter
 * can use without ever touching an FC-specific API.
 */
export interface NormalizedRequest {
  /** The HTTP method (upper-case). */
  method: string
  /** The absolute request URL. */
  url: URL
  /** Lower-cased headers. */
  headers: Record<string, string>
  /** The raw query string (without the leading `?`). */
  rawQueryString: string
  /** Raw cookie strings (e.g. `['a=1', 'b=2']`). */
  cookies: string[]
  /** Best-effort client IP (FC `clientIP`, then forwarding headers). */
  ip: string
  /** The raw request body (text for textual content types, bytes otherwise, `undefined` if none). */
  rawBody?: string | Uint8Array
}

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
 * @param clientIP - The FC-provided client IP, if any.
 * @param headers - The normalized headers.
 * @returns The client IP, or an empty string when unknown.
 */
export function resolveIp (clientIP: string | undefined, headers: Record<string, string>): string {
  if (typeof clientIP === 'string' && clientIP.length > 0) { return clientIP }

  for (const name of IP_HEADERS) {
    const value = headers[name]
    if (typeof value === 'string' && value.length > 0) {
      return value.split(',')[0].trim()
    }
  }
  return ''
}

/**
 * Whether a content type is textual (and can be safely decoded to a string).
 *
 * @param contentType - The `content-type` header value.
 * @returns True for textual payloads.
 */
export function isTextualContentType (contentType: string | undefined): boolean {
  if (contentType === undefined) { return true }
  return /^(text\/|application\/(json|xml|.*\+json|.*\+xml|x-www-form-urlencoded|javascript))/i.test(contentType)
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
