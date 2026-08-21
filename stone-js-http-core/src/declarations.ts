import send from 'send'
import { IncomingHttpHeaders } from 'node:http'
import { IncomingHttpEvent } from './IncomingHttpEvent'

/**
 * Represents the type of HTTP headers.
 *
 * It supports standard Fetch API `Headers`, `Map` of string keys and values, or a plain object.
 */
export type HeadersType = Headers | Map<string, string | string[]> | Record<string, string | string[]>

/**
 * Enum representing possible values for the `SameSite` attribute in cookies.
 */
export enum CookieSameSite {
  Lax = 'lax',
  None = 'none',
  Strict = 'strict',
}

/**
 * Options for configuring a cookie.
 */
export interface CookieOptions {
  path?: string
  expires?: Date
  domain?: string
  maxAge?: number
  secure?: boolean
  httpOnly?: boolean
  sameSite?: CookieSameSite
}

/**
 * Enum representing standard HTTP methods.
 */
export enum HttpMethods {
  GET = 'GET',
  PUT = 'PUT',
  HEAD = 'HEAD',
  POST = 'POST',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  OPTIONS = 'OPTIONS'
}

/**
 * Represents valid HTTP methods as string literals.
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD'

/**
 * Describes a route definition, including its URI, method, and parameters.
 */
export interface IRoute {
  uri: string
  method: HttpMethod
  params: Record<string, unknown>
  getOptions: <TReturn = unknown>(keys: string[]) => Record<string, TReturn>
  /**
   * One option by name, which is how a route's own declarations are read.
   *
   * Optional in the contract because this package duck-types a route rather than depending on the
   * router: an implementer that only answers `getOptions` stays valid.
   */
  getOption?: <TReturn = unknown>(key: string, fallback?: TReturn) => TReturn | undefined
  getParam: <TReturn = unknown>(name: string, fallback?: TReturn) => TReturn | undefined
}

/**
 * Represents a file stream options.
 */
export type StreamFileOptions = send.SendOptions & { headers: IncomingHttpHeaders }

/**
 * Represents an incoming HTTP event.
 */
export type IIncomingHttpEvent = IncomingHttpEvent

/**
 * Represents an outgoing HTTP response.
 */
export interface IOutgoingHttpResponse {
  etag: string | undefined
  status: number | undefined
  lastModified: string | undefined
}

/**
 * The kinds of answer a route can declare.
 *
 * The HTTP words, and nothing invented: a route says what it answers with, and the framework builds it.
 */
export type DeclaredResponseType = 'json' | 'jsonp' | 'html' | 'text' | 'file' | 'redirect' | 'no-content'

/**
 * What a route declares about its answer.
 *
 * `@Get('/tasks', { response: { type: 'json', status: 200 } })` puts the shape of the answer where the
 * rest of the endpoint is already described, instead of on the method. `request` and `response` are the
 * two halves of the same sentence, which is why it carries that name.
 *
 * Every field is optional, and the defaults are the obvious ones: JSON, and `200` (or `302` for a
 * redirect, `204` for no content). A method decorator such as `@JsonHttpResponse(201)` still wins,
 * because it produces the response itself and the more specific statement should.
 */
export interface DeclaredResponse {
  /** What kind of answer it is. Defaults to `json`. */
  type?: DeclaredResponseType
  /** The status a successful answer carries. Also what the published contract documents. */
  status?: number
  /** Headers to send with it. */
  headers?: HeadersType
}
