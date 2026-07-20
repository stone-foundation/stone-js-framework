import { AzureHttpRequest } from './declarations'

/**
 * A canonical HTTP request derived from a Web `Request`.
 *
 * A `Request` is already the Web standard, so normalisation is mostly a matter of reading the
 * (single-shot) body once and lifting headers/cookies/ip into a plain, agnostic shape the rest of
 * the adapter can use without ever touching a runtime-specific API.
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
  /** Best-effort client IP from forwarding headers. */
  ip: string
  /** The raw request body (text for textual content types, bytes otherwise, `undefined` if none). */
  rawBody?: string | Uint8Array
}

/** Header names carrying the client IP, in order of preference (Azure front end sets x-forwarded-for). */
const IP_HEADERS = ['x-forwarded-for', 'x-real-ip', 'x-client-ip']

/**
 * Turns a `Headers` object into a plain lower-cased record.
 *
 * @param headers - The Web headers.
 * @returns A plain record.
 */
export function headersToRecord (headers: Headers): Record<string, string> {
  const out: Record<string, string> = {}
  headers.forEach((value, key) => { out[key.toLowerCase()] = value })
  return out
}

/**
 * Resolves the best-effort client IP from forwarding headers.
 *
 * @param headers - The normalized headers.
 * @returns The client IP, or an empty string when unknown.
 */
export function resolveIp (headers: Record<string, string>): string {
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
 * Reads a request body once, returning text for textual content types and bytes otherwise.
 *
 * @param request - The Web request.
 * @returns The raw body, or `undefined` when there is no body.
 */
export async function readRawBody (request: AzureHttpRequest): Promise<string | Uint8Array | undefined> {
  if (request.body === null || request.body === undefined) { return undefined }

  const buffer = new Uint8Array(await request.arrayBuffer())
  if (buffer.byteLength === 0) { return undefined }

  return isTextualContentType(request.headers.get('content-type') ?? undefined)
    ? new TextDecoder().decode(buffer)
    : buffer
}

/**
 * Normalises a Web `Request` into the canonical {@link NormalizedRequest}.
 *
 * @param request - The Web request.
 * @returns The normalized request.
 */
export async function normalizeRequest (request: AzureHttpRequest): Promise<NormalizedRequest> {
  const url = new URL(request.url)
  const headers = headersToRecord(request.headers)
  const cookieHeader = headers.cookie ?? ''

  return {
    url,
    headers,
    method: request.method.toUpperCase(),
    rawQueryString: url.search.startsWith('?') ? url.search.slice(1) : url.search,
    cookies: cookieHeader.length > 0 ? cookieHeader.split(/; */) : [],
    ip: resolveIp(headers),
    rawBody: await readRawBody(request)
  }
}
