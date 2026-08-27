/**
 * Normalising a Web-standard request, once, for every platform that speaks one.
 *
 * Two adapters are handed an actual Web request and read it identically: `@stone-js/fetch-adapter`
 * for the edge runtimes and `@stone-js/azure-functions-http-adapter`. Each had its own copy of this
 * file, differing by nine lines out of a hundred, and each exported the whole of it, so six
 * implementation details became public API in two packages at once.
 *
 * A third, `@stone-js/alibaba-fc-http-adapter`, is handed a plain object rather than a request: its
 * headers are a record and its body is already a `Buffer`. So it keeps its own reader and takes from
 * here what is genuinely shared, the normalized shape and the header-level predicates. Reuse follows
 * what the platform hands over, not what the file is called.
 *
 * It lives here because it is genuinely runtime-agnostic: a `Request`, `Headers` and `URL` exist in
 * Node, in a browser and at the edge, and this file touches nothing else. What is **not** shared is
 * the order of the headers a platform's own edge writes the client address into, so that is an
 * argument rather than a constant: a copy per platform to change one list is how three files drift.
 */

/**
 * The part of a Web request this needs.
 *
 * A duck type rather than `Request`, because a platform's own request class is Web-shaped without
 * being that exact type: Azure's is one, and typing against the nominal class is what forced a copy
 * of the whole file to change a signature.
 */
export interface WebRequestLike {
  /** The absolute request URL. */
  url: string
  /** The HTTP method. */
  method: string
  /** The request headers. */
  headers: { get: (name: string) => string | null, forEach: (fn: (value: string, key: string) => void) => void }
  /** Whether there is a body at all. */
  body?: unknown
  /** The body, as bytes. */
  arrayBuffer: () => Promise<ArrayBuffer>
}

/**
 * A canonical HTTP request derived from a Web request.
 *
 * A Web request is already the standard, so normalisation is mostly a matter of reading the
 * single-shot body once and lifting headers, cookies and address into a plain shape the rest of an
 * adapter uses without touching a runtime-specific API.
 */
export interface NormalizedWebRequest {
  /** The HTTP method, upper-case. */
  method: string
  /** The absolute request URL. */
  url: URL
  /** Lower-cased headers. */
  headers: Record<string, string>
  /** The raw query string, without the leading `?`. */
  rawQueryString: string
  /** Raw cookie strings, for instance `['a=1', 'b=2']`. */
  cookies: string[]
  /** Best-effort client address from forwarding headers. */
  ip: string
  /** The raw body: text for textual content types, bytes otherwise, nothing when there is none. */
  rawBody?: string | Uint8Array
}

/**
 * The headers a client address is read from, most trusted first, when a platform names none.
 *
 * Deliberately generic. Every platform's edge writes a different one, and the right order is the one
 * that platform guarantees: `@stone-js/fetch-adapter` prefers `cf-connecting-ip`, Azure prefers
 * `x-forwarded-for`. A default that pretended to know would be wrong somewhere.
 */
export const DEFAULT_IP_HEADERS: readonly string[] = ['x-forwarded-for', 'x-real-ip', 'x-client-ip']

/**
 * A `Headers` object as a plain lower-cased record.
 *
 * @param headers - The Web headers.
 * @returns A plain record.
 */
export function headersToRecord (headers: WebRequestLike['headers']): Record<string, string> {
  const record: Record<string, string> = {}

  headers.forEach((value, key) => { record[key.toLowerCase()] = value })

  return record
}

/**
 * The best-effort client address, from the headers a platform says carry it.
 *
 * The order is the caller's, because only the caller knows which of these its own edge overwrites. A
 * forwarded header nothing overwrites is client-spoofable, so reading a longer list than the platform
 * guarantees hands a caller a supply of addresses.
 *
 * @param headers - The normalized headers.
 * @param preferred - The header names, most trusted first.
 * @returns The address, or an empty string when unknown.
 */
export function resolveIp (
  headers: Record<string, string>,
  preferred: readonly string[] = DEFAULT_IP_HEADERS
): string {
  for (const name of preferred) {
    const value = headers[name]

    if (typeof value === 'string' && value.length > 0) {
      return value.split(',')[0].trim()
    }
  }

  return ''
}

/**
 * Whether a content type is textual, and can be decoded to a string.
 *
 * @param contentType - The `content-type` header value.
 * @returns True for textual payloads.
 */
export function isTextualContentType (contentType: string | undefined): boolean {
  if (contentType === undefined) { return true }

  return /^(text\/|application\/(json|xml|.*\+json|.*\+xml|x-www-form-urlencoded|javascript))/i.test(contentType)
}

/**
 * The body, read once: text for a textual content type, bytes otherwise.
 *
 * Once, because a Web request body is single-shot: reading it twice throws, and an adapter that read
 * it to sniff a type would leave nothing for the handler.
 *
 * @param request - The Web request.
 * @returns The raw body, or nothing when there is none.
 */
export async function readRawBody (request: WebRequestLike): Promise<string | Uint8Array | undefined> {
  if (request.body === null || request.body === undefined) { return undefined }

  const buffer = new Uint8Array(await request.arrayBuffer())

  if (buffer.byteLength === 0) { return undefined }

  return isTextualContentType(request.headers.get('content-type') ?? undefined)
    ? new TextDecoder().decode(buffer)
    : buffer
}

/**
 * A Web request, normalized.
 *
 * @param request - The Web request.
 * @param ipHeaders - The headers this platform's edge writes the client address into.
 * @returns The normalized request.
 */
export async function normalizeWebRequest (
  request: WebRequestLike,
  ipHeaders: readonly string[] = DEFAULT_IP_HEADERS
): Promise<NormalizedWebRequest> {
  const url = new URL(request.url)
  const headers = headersToRecord(request.headers)
  const cookieHeader = headers.cookie ?? ''

  return {
    url,
    headers,
    method: request.method.toUpperCase(),
    rawQueryString: url.search.startsWith('?') ? url.search.slice(1) : url.search,
    cookies: cookieHeader.length > 0 ? cookieHeader.split(/; */) : [],
    ip: resolveIp(headers, ipHeaders),
    rawBody: await readRawBody(request)
  }
}
