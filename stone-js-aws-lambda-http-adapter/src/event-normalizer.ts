import { AwsLambdaHttpEvent } from './declarations'

/**
 * Platform-agnostic normalization of the many AWS "HTTP" Lambda event shapes.
 *
 * A single Lambda function can be fronted by very different integrations, each with its own
 * event schema: API Gateway REST (payload v1), API Gateway HTTP API and Lambda Function URLs
 * (payload v2), and Application Load Balancer (ALB). This module reduces all of them to one
 * canonical {@link NormalizedHttpEvent} so the rest of the adapter never branches on the trigger.
 *
 * References:
 * - v1 (REST): `httpMethod`, `path`, `queryStringParameters` + `multiValueQueryStringParameters`,
 *   `headers` + `multiValueHeaders`, cookies in the `Cookie` header, `requestContext.identity.sourceIp`.
 * - v2 (HTTP API / Function URLs): `version:'2.0'`, `requestContext.http.{method,sourceIp,path}`,
 *   `rawPath`, `rawQueryString`, `headers`, `cookies: string[]`.
 * - ALB: `requestContext.elb`, `httpMethod`, `path`, either `queryStringParameters` or
 *   `multiValueQueryStringParameters` (depending on the target group's multi-value setting).
 */

/**
 * The detected AWS HTTP trigger family.
 */
export type AwsHttpEventVersion = 'v1' | 'v2' | 'alb'

/**
 * A canonical HTTP request derived from any AWS HTTP Lambda event.
 */
export interface NormalizedHttpEvent {
  /** The detected trigger family. */
  version: AwsHttpEventVersion
  /** The HTTP method (upper-case). */
  method: string
  /** The request path (no query string). */
  path: string
  /** The raw query string (without leading `?`), fidelity-preserving. */
  rawQueryString: string
  /** Lower-cased headers; multi-value headers joined with `, `. */
  headers: Record<string, string>
  /** Raw cookie strings (e.g. `['a=1', 'b=2']`). */
  cookies: string[]
  /** The best-effort client source IP. */
  sourceIp: string
  /** Whether {@link body} is base64-encoded. */
  isBase64Encoded: boolean
  /** The raw request body as delivered by AWS (string or undefined). */
  body?: string
}

/**
 * Detect which AWS HTTP trigger produced the event.
 *
 * @param event - The raw Lambda event.
 * @returns The trigger family.
 */
export function detectEventVersion (event: AwsLambdaHttpEvent): AwsHttpEventVersion {
  const requestContext = event.requestContext as Record<string, unknown> | undefined
  if (requestContext?.elb !== undefined) { return 'alb' }
  if (event.version === '2.0' || requestContext?.http !== undefined) { return 'v2' }
  return 'v1'
}

/**
 * Normalize headers to lower-cased keys, merging single and multi-value headers.
 *
 * @param event - The raw Lambda event.
 * @returns Lower-cased headers with multi-value entries joined by `, `.
 */
export function normalizeHeaders (event: AwsLambdaHttpEvent): Record<string, string> {
  const out: Record<string, string> = {}

  const multi = event.multiValueHeaders as Record<string, string[] | undefined> | undefined
  if (multi !== null && multi !== undefined) {
    for (const [name, values] of Object.entries(multi)) {
      if (Array.isArray(values)) { out[name.toLowerCase()] = values.join(', ') }
    }
  }

  const single = event.headers as Record<string, string | undefined> | null | undefined
  if (single !== null && single !== undefined) {
    for (const [name, value] of Object.entries(single)) {
      if (value !== undefined) { out[name.toLowerCase()] = value }
    }
  }

  return out
}

/**
 * Build the raw query string from whichever representation the trigger provides.
 *
 * v2 gives the fidelity-preserving `rawQueryString`. v1/ALB give an object (single value) and
 * optionally `multiValueQueryStringParameters` (preferred, preserves repeated keys). Values are
 * URL-encoded so repeated/array values survive.
 *
 * @param event - The raw Lambda event.
 * @param version - The detected trigger family.
 * @returns The raw query string (no leading `?`).
 */
export function buildRawQueryString (event: AwsLambdaHttpEvent, version: AwsHttpEventVersion): string {
  if (version === 'v2' && typeof event.rawQueryString === 'string') {
    return event.rawQueryString
  }

  const multi = event.multiValueQueryStringParameters as Record<string, string[] | undefined> | undefined
  if (multi !== null && multi !== undefined) {
    const params = new URLSearchParams()
    for (const [key, values] of Object.entries(multi)) {
      for (const value of values ?? []) { params.append(key, value) }
    }
    return params.toString()
  }

  const single = event.queryStringParameters as Record<string, string | undefined> | null | undefined
  if (single !== null && single !== undefined) {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(single)) {
      if (value !== undefined) { params.append(key, value) }
    }
    return params.toString()
  }

  return ''
}

/**
 * Collect the raw cookie strings, regardless of trigger.
 *
 * v2 delivers `event.cookies: string[]`. v1/ALB deliver a single `Cookie` header (already merged
 * into {@link NormalizedHttpEvent.headers}).
 *
 * @param event - The raw Lambda event.
 * @param headers - The normalized headers.
 * @returns The raw cookie strings.
 */
export function collectCookies (event: AwsLambdaHttpEvent, headers: Record<string, string>): string[] {
  if (Array.isArray(event.cookies)) { return event.cookies }
  const header = headers.cookie
  return typeof header === 'string' && header.length > 0 ? header.split(/; */) : []
}

/**
 * Resolve the client source IP across triggers.
 *
 * @param event - The raw Lambda event.
 * @param version - The detected trigger family.
 * @param headers - The normalized headers.
 * @returns The source IP (empty string if unknown).
 */
export function resolveSourceIp (event: AwsLambdaHttpEvent, version: AwsHttpEventVersion, headers: Record<string, string>): string {
  const requestContext = event.requestContext as any
  if (version === 'v2') { return String(requestContext?.http?.sourceIp ?? '') }
  if (version === 'v1') { return String(requestContext?.identity?.sourceIp ?? '') }
  // ALB carries no identity; the client IP is the first hop in X-Forwarded-For.
  return (headers['x-forwarded-for'] ?? '').split(',')[0].trim()
}

/**
 * Normalize any AWS HTTP Lambda event into the canonical {@link NormalizedHttpEvent}.
 *
 * @param event - The raw Lambda event.
 * @returns The normalized request.
 */
export function normalizeHttpEvent (event: AwsLambdaHttpEvent): NormalizedHttpEvent {
  const version = detectEventVersion(event)
  const headers = normalizeHeaders(event)
  const requestContext = event.requestContext as any

  const method = String(
    (version === 'v2' ? requestContext?.http?.method : undefined) ??
    event.httpMethod ??
    requestContext?.httpMethod ??
    requestContext?.http?.method ??
    'GET'
  ).toUpperCase()

  const path = String(
    (version === 'v2' ? (event.rawPath ?? requestContext?.http?.path) : undefined) ??
    event.path ??
    event.rawPath ??
    '/'
  )

  return {
    version,
    method,
    path,
    headers,
    rawQueryString: buildRawQueryString(event, version),
    cookies: collectCookies(event, headers),
    sourceIp: resolveSourceIp(event, version, headers),
    isBase64Encoded: event.isBase64Encoded === true,
    body: typeof event.body === 'string' ? event.body : undefined
  }
}

/**
 * Extract the raw request body exactly as received, decoding base64 to a Buffer when needed.
 *
 * This is what the adapter exposes as `metadata.rawBody`: the untouched payload the client sent,
 * available to consumers even when no body-parsing middleware is installed. Binary payloads are
 * returned as a `Buffer` (never a lossy UTF-8 round-trip); text payloads as a string. A
 * non-string, non-base64 body (e.g. a pre-parsed object from a test/custom integration) is
 * returned as-is.
 *
 * @param event - The raw Lambda event.
 * @returns The raw body as a Buffer, string, the original value, or undefined.
 */
export function getRawBody (event: AwsLambdaHttpEvent): unknown {
  if (typeof event.body === 'string') {
    return event.isBase64Encoded === true ? Buffer.from(event.body, 'base64') : event.body
  }
  return event.body
}
