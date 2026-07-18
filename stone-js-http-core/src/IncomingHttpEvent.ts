import fresh from 'fresh'
import mime from 'mime/lite'
import typeIs from 'type-is'
import accepts from 'accepts'
import { URL } from 'node:url'
import rangeParser from 'range-parser'
import { Cookie } from './cookies/Cookie'
import contentTypeLib from 'content-type'
import { getPath, hasPath } from '@stone-js/config'
import { HttpError } from './errors/HttpError'
import { UploadedFile } from '@stone-js/filesystem'
import { CookieCollection } from './cookies/CookieCollection'
import { IncomingEvent, IncomingEventOptions } from '@stone-js/core'
import { HttpMethods, IOutgoingHttpResponse, IRoute } from './declarations'

/**
 * IncomingHttpEventOptions interface.
 */
export interface IncomingHttpEventOptions extends IncomingEventOptions {
  url: URL
  ip: string
  ips?: string[]
  protocol?: string
  method?: HttpMethods
  queryString?: string
  cookies?: CookieCollection
  body?: Record<string, unknown>
  files?: Record<string, UploadedFile[]>
  headers?: Record<string, string> | Headers
}

/**
 * Class representing an IncomingHttpEvent.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 */
export class IncomingHttpEvent extends IncomingEvent {
  static readonly INCOMING_HTTP_EVENT = 'stonejs@incoming_http_event'

  /** The IP address of the client making the request. */
  public readonly ip: string
  /** The list of IP addresses, typically for proxies. */
  public readonly ips: string[]
  /** The URL of the request. */
  public readonly url: URL
  /** The body of the request. */
  public readonly body: Record<string, unknown>
  /** The files included in the request. */
  public readonly files: Record<string, UploadedFile[]>
  /** The query parameters of the request. */
  public readonly query: URLSearchParams
  /** The HTTP method of the request. */
  public readonly method: HttpMethods
  /** The content negotiation handler for the request. */
  public readonly accepts: accepts.Accepts
  /** The headers of the request. */
  protected readonly _headers: Headers
  /** The cookies included in the request. */
  public readonly cookies: CookieCollection
  /** The protocol used for the request (e.g., http or https). */
  public readonly protocol: string
  /** The query string of the request. */
  public readonly queryString?: string

  protected userResolver?: () => unknown
  protected routeResolver?: () => IRoute

  /**
   * Create an IncomingHttpEvent.
   *
   * @param options - The IncomingHttpEvent options.
   * @returns A new instance of IncomingHttpEvent.
   */
  static create (options: IncomingHttpEventOptions): IncomingHttpEvent {
    return new this(options)
  }

  /**
   * Constructor for IncomingHttpEvent.
   *
   * @param options - The options to create an IncomingHttpEvent instance.
   * @throws {HttpError} If the URL option is not a valid instance of URL.
   */
  protected constructor ({
    ip,
    url,
    source,
    ips = [],
    body = {},
    files = {},
    locale = 'en',
    headers = {},
    metadata = {},
    protocol = 'http',
    cookies = undefined,
    queryString = undefined,
    method = HttpMethods.GET
  }: IncomingHttpEventOptions) {
    super({ type: IncomingHttpEvent.INCOMING_HTTP_EVENT, source, metadata, locale })

    if (!(url instanceof URL)) {
      throw new HttpError('The `url` option must be an instance of `URL`.')
    }

    this.ip = ip
    this.ips = ips
    this.url = url
    this.body = body
    this.files = files
    this.method = method
    this.protocol = protocol
    this.queryString = queryString
    this.cookies = cookies ?? CookieCollection.create()
    this.query = new URLSearchParams(this.queryString ?? '')
    this._headers = headers instanceof Headers ? headers : new Headers(headers)

    // Must be called after the headers are set
    this.accepts = accepts(this as any)
  }

  /** @returns The headers of the request. */
  get headers (): Record<string, string> {
    return Object.fromEntries(this._headers.entries())
  }

  /** @returns The decoded pathname of the URL. */
  get decodedPathname (): string | undefined {
    try {
      return decodeURIComponent(this.url.pathname)
    } catch {
      return undefined
    }
  }

  /** @returns The hash part of the URL. */
  get hash (): string {
    return this.url.hash
  }

  /** @returns The host of the URL (hostname:port). */
  get host (): string {
    return this.url.host
  }

  /** @returns The hostname of the URL. */
  get hostname (): string {
    return this.url.hostname
  }

  /** @returns The route parameters. */
  get params (): Record<string, unknown> | undefined {
    return this.getRoute()?.params
  }

  /** @returns The full path including pathname and search query. */
  get path (): string {
    return `${this.url.pathname}${this.url.search}`
  }

  /** @returns The pathname of the URL. */
  get pathname (): string {
    return this.url.pathname
  }

  /** @returns The full URL as a string. */
  get uri (): string {
    return this.url.href
  }

  /** @returns The protocol of the URL (e.g., "http" or "https"). */
  get scheme (): string {
    return this.protocol
  }

  /** @returns The URL segments split by '/'. */
  get segments (): string[] {
    return this.url.pathname.split('/')
  }

  /** @returns Whether the request was made over a secure connection. */
  get isSecure (): boolean {
    return this.protocol === 'https'
  }

  /** @returns Whether the request is an XMLHttpRequest. */
  get isXhr (): boolean {
    return this.getHeader('X-Requested-With', '')?.toLowerCase() === 'xmlhttprequest'
  }

  /** @returns Whether the request is an AJAX request. */
  get isAjax (): boolean {
    return this.isXhr
  }

  /** @returns The user agent of the request. */
  get userAgent (): string | undefined {
    return this.getHeader('user-agent')
  }

  /** @returns Whether the request was prefetch. */
  get isPrefetch (): boolean {
    // `Purpose: prefetch` (legacy) or the modern `Sec-Purpose`, whose value is a token list such
    // as `prefetch;prerender` — match the token, not the whole string.
    const purpose = (this.getHeader<string>('Sec-Purpose') ?? this.getHeader<string>('Purpose') ?? '').toLowerCase()
    return purpose.includes('prefetch') || purpose.includes('prerender')
  }

  /** @returns The ETag of the request, if present. */
  get etag (): string | undefined {
    return this.getHeader('ETag')
  }

  /** @returns An array of acceptable content types for the request. */
  get types (): string[] {
    return this.accepts.types() as string[]
  }

  /** @returns An array of acceptable character sets for the request. */
  get charsets (): string[] {
    return this.accepts.charsets()
  }

  /** @returns An array of acceptable languages for the request. */
  get languages (): string[] {
    return this.accepts.languages()
  }

  /** @returns An array of acceptable encodings for the request. */
  get encodings (): string[] {
    return this.accepts.encodings()
  }

  /** @returns The content type specified in the headers. */
  get contentType (): string {
    return contentTypeLib.parse(this._headers.get('content-type') ?? 'text/html').type
  }

  /** @returns The charset specified in the content-type header. */
  get charset (): string | undefined {
    return contentTypeLib.parse(this._headers.get('content-type') ?? 'text/html').parameters.charset
  }

  /**
   * Get request DATA by key (route params → body → query → metadata).
   *
   * SECURITY: does NOT read headers or cookies — use {@link getHeader}/{@link getCookie}.
   *
   * @param key - The key to look for.
   * @returns The value of the key, or undefined.
  */
  get<TReturn = unknown>(key: string): TReturn | undefined

  /**
   * Get request DATA by key with a fallback (route params → body → query → metadata).
   *
   * SECURITY: does NOT read headers or cookies — use {@link getHeader}/{@link getCookie}.
   *
   * @param key - The key to look for.
   * @param fallback - A fallback value if the key is not found.
   * @returns The value of the key or the fallback.
  */
  get<TReturn = unknown>(key: string, fallback: TReturn): TReturn

  /**
   * Get request DATA by key, across the request-data sources only.
   *
   * Priority: route params → body → query → metadata → fallback.
   *
   * SECURITY: `get()` deliberately does NOT read headers or cookies. Mixing trust levels
   * (route params are kernel-trusted; body/query are attacker-controlled) in one lookup let an
   * attacker spoof a header value — e.g. `event.get('authorization')` could be satisfied by
   * `?authorization=...`. Read trusted transport values through the dedicated, unspoofable
   * accessors {@link getHeader} and {@link getCookie} instead.
   *
   * @param key - The key to look for.
   * @param fallback - A fallback value if the key is not found.
   * @returns The value of the key or the fallback.
  */
  get<TReturn = unknown>(key: string, fallback?: TReturn): TReturn | undefined {
    return (
      this.getParam(key) ??
      this.getFromBody(key) ??
      this.getFromQueryParams(key) ??
      this.getMetadataValue(key, fallback)
    ) as TReturn | undefined
  }

  /**
   * Get a header value.
   *
   * @param name - The header name.
   * @returns The header value or the fallback value.
   * @throws {HttpError} If the header name is not a valid string.
   */
  getHeader<TReturn = string>(name: string): TReturn | undefined

  /**
   * Get a header value.
   *
   * @param name - The header name.
   * @param fallback - A fallback value if the header is not found.
   * @returns The header value or the fallback value.
   * @throws {HttpError} If the header name is not a valid string.
   */
  getHeader<TReturn = string>(name: string, fallback: TReturn): TReturn

  /**
   * Get a header value.
   *
   * @param name - The header name.
   * @param fallback - A fallback value if the header is not found.
   * @returns The header value or the fallback value.
   * @throws {HttpError} If the header name is not a valid string.
   */
  getHeader<TReturn = string>(name: string, fallback?: TReturn): TReturn | undefined {
    if (!this.isValidName(name)) { throw new HttpError('Header name must be a non-empty string.') }
    const lcName = name.toLowerCase()
    if (['referer', 'referrer'].includes(lcName)) { return (this._headers.get('referer') ?? this._headers.get('referrer') ?? fallback) as TReturn }
    return (this._headers.get(lcName) ?? fallback) as TReturn | undefined
  }

  /**
   * Check if a header exists.
   *
   * @param name - The header name to check.
   * @returns True if the header exists, otherwise false.
   */
  hasHeader (name: string): boolean {
    if (!this.isValidName(name)) { throw new HttpError('Header name must be a non-empty string.') }
    return this._headers.has(name.toLowerCase())
  }

  /**
   * Get a cookie value.
   *
   * @param name - The cookie name.
   * @returns The cookie value or the fallback.
   */
  getCookie<TReturn extends Cookie = Cookie>(name: string): TReturn | undefined

  /**
   * Get a cookie value.
   *
   * @param name - The cookie name.
   * @param fallback - A fallback value if the cookie is not found.
   * @returns The cookie value or the fallback.
   */
  getCookie<TReturn extends Cookie = Cookie>(name: string, fallback: TReturn): TReturn

  /**
   * Get a cookie value.
   *
   * @param name - The cookie name.
   * @param fallback - A fallback value if the cookie is not found.
   * @returns The cookie value or the fallback.
   */
  getCookie<TReturn extends Cookie = Cookie>(name: string, fallback?: TReturn): TReturn | undefined {
    if (!this.isValidName(name)) { throw new HttpError('Cookie name must be a non-empty string.') }
    return (this.cookies.get(name) ?? this.cookies.get(name.toLowerCase()) ?? fallback) as TReturn | undefined
  }

  /**
   * Check if a cookie exists.
   *
   * @param name - The cookie name to check.
   * @returns True if the cookie exists, otherwise false.
   */
  hasCookie (name: string): boolean {
    if (!this.isValidName(name)) { throw new HttpError('Cookie name must be a non-empty string.') }
    return this.cookies.has(name) || this.cookies.has(name.toLowerCase())
  }

  /**
   * Get the body of the request.
   *
   * @returns The body of the request or the fallback.
   */
  getBody<TReturn = unknown>(): TReturn | undefined

  /**
   * Get the body of the request.
   *
   * @param fallback - The fallback value if the body is not found.
   * @returns The body of the request or the fallback.
   */
  getBody<TReturn = unknown>(fallback: TReturn): TReturn

  /**
   * Get the body of the request.
   *
   * @param fallback - The fallback value if the body is not found.
   * @returns The body of the request or the fallback.
   */
  getBody<TReturn = unknown>(fallback?: TReturn): TReturn | undefined {
    return (this.body ?? fallback) as TReturn | undefined
  }

  /**
   * Return the first accepted content type.
   *
   * @param values - The content types to check.
   * @returns The first accepted type, or false if none are accepted.
   */
  acceptsTypes (...values: string[]): string | string[] | false {
    return this.accepts.type(values.flat())
  }

  /**
   * Return the first accepted encoding.
   *
   * @param values - The encodings to check.
   * @returns The first accepted encoding, or false if none are accepted.
   */
  acceptsEncodings (...values: string[]): string | string[] | false {
    return this.accepts.encoding(values.flat())
  }

  /**
   * Return the first accepted charset.
   *
   * @param values - The charsets to check.
   * @returns The first accepted charset, or false if none are accepted.
   */
  acceptsCharsets (...values: string[]): string | string[] | false {
    return this.accepts.charset(values.flat())
  }

  /**
   * Return the first accepted language.
   *
   * @param values - The languages to check.
   * @returns The first accepted language, or false if none are accepted.
   */
  acceptsLanguages (...values: string[]): string | string[] | false {
    return this.accepts.language(values.flat())
  }

  /**
   * Get MIME type for a given file path or extension.
   *
   * @param format - The file path or extension.
   * @returns The corresponding MIME type, or undefined if not found.
   */
  getMimeType (format: string): string | undefined {
    return mime.getType(format) ?? undefined
  }

  /**
   * Get file extension for a given MIME type.
   *
   * @param mimeType - The MIME type.
   * @returns The corresponding file extension, or undefined if not found.
   */
  getFormat (mimeType: string): string | undefined {
    return mime.getExtension(mimeType) ?? undefined
  }

  /**
   * Check if the request matches one of the given content types.
   *
   * @param types - The content types to check.
   * @returns The best match, or false if no match is found.
   */
  isType (...types: string[]): string | false {
    return typeIs.is(this.contentType, types.flat())
  }

  /**
   * Determines the preferred response type based on content negotiation.
   * Uses Accept, Content-Type, User-Agent, and AJAX detection.
   *
   * @param types - Allowed response types, in priority order.
   * @param defaultType - Default type if none match.
   * @returns The best response type as a string.
   */
  preferredType (types: string[] = ['json', 'html', 'xml', 'text'], defaultType: string = 'json'): string {
    // 1. Check Accept header (highest priority)
    const acceptType = this.acceptsTypes(...types)
    if (acceptType !== false) return Array.isArray(acceptType) ? acceptType[0] : acceptType

    // 2. Check Content-Type (valid if the request is sending data)
    const contentType = this.isType(...types)
    if (contentType !== false) return contentType

    // 3. Check if the request is AJAX/XHR (favoring JSON responses)
    if (this.isXhr) return 'json'

    // 4. Check User-Agent for CLI tools like `curl` (favor plain text)
    if (this.userAgent?.includes('curl') === true || this.userAgent?.includes('wget') === true) return 'text'

    // 5. Return the default type
    return defaultType
  }

  /**
   * Get request range.
   *
   * @param size - The maximum size of the resource.
   * @param combine - Specifies if overlapping & adjacent ranges should be combined.
   * @returns The parsed range, or undefined if not applicable.
   */
  range (size: number, combine = false): rangeParser.Result | rangeParser.Ranges | undefined {
    if (!this.hasHeader('Range')) return
    return rangeParser(size, this.getHeader('Range', ''), { combine })
  }

  /**
   * Get a value from the JSON body.
   *
   * @param key - The key to look for in the JSON body.
   * @returns The value of the key or the fallback.
   */
  json<TReturn = unknown>(key: string): TReturn | undefined

  /**
   * Get a value from the JSON body.
   *
   * @param key - The key to look for in the JSON body.
   * @param fallback - A fallback value if the key is not found.
   * @returns The value of the key or the fallback.
   */
  json<TReturn = unknown>(key: string, fallback: TReturn): TReturn

  /**
   * Get a value from the JSON body.
   *
   * @param key - The key to look for in the JSON body.
   * @param fallback - A fallback value if the key is not found.
   * @returns The value of the key or the fallback.
   */
  json<TReturn = unknown>(key: string, fallback?: TReturn): TReturn | undefined {
    if (this.hasJson(key)) {
      return getPath<TReturn>(this.body, key, fallback)
    }
    return fallback
  }

  /**
   * Check if a key exists in the JSON body.
   *
   * @param key - The key to check for.
   * @returns True if the key exists, otherwise false.
   */
  hasJson (key: string): boolean {
    return this.isType('json') === 'json' && hasPath(this.body, key)
  }

  /**
   * Determine if the response cache is fresh.
   *
   * @param response - The outgoing HTTP response to check freshness against.
   * @returns True if the cache is fresh, otherwise false.
   */
  isFresh (response: IOutgoingHttpResponse): boolean {
    const status = response.status ?? 500
    return ['GET', 'HEAD'].includes(this.method) &&
      ((status >= 200 && status < 300) || status === 304) &&
      fresh(this.headers, {
        etag: response.etag,
        'last-modified': response.lastModified
      })
  }

  /**
   * Determine if the response cache is stale.
   *
   * @param response - The outgoing HTTP response to check staleness against.
   * @returns True if the cache is stale, otherwise false.
   */
  isStale (response: IOutgoingHttpResponse): boolean {
    return !this.isFresh(response)
  }

  /**
   * Filter and return files based on their names.
   *
   * @param files - The array of file names to filter.
   * @returns An object containing the filtered files.
   */
  filterFiles (files: string[]): Record<string, UploadedFile[]> {
    return Object.fromEntries(Object.entries(this.files).filter(([key]) => files.includes(key)))
  }

  /**
   * Get a file by its name.
   *
   * @param name - The name of the file.
   * @returns The file if it exists, otherwise undefined.
   */
  getFile (name: string): UploadedFile[] | undefined {
    return this.files[name]
  }

  /**
   * Check if a file exists by its name.
   *
   * @param name - The name of the file.
   * @returns True if the file exists, otherwise false.
   */
  hasFile (name: string): boolean {
    return name in this.files && this.files[name].length > 0
  }

  /**
   * Check if the current event method matches the given method.
   *
   * @param method - The method to check.
   * @returns True if the event method matches, otherwise false.
   */
  isMethod (method: string): boolean {
    return this.method.toUpperCase() === method.toUpperCase()
  }

  /**
   * Check if the current event method is considered safe.
   *
   * @returns True if the method is safe, otherwise false.
   */
  isMethodSafe (): boolean {
    return ['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(this.method)
  }

  /**
   * Check if the current event method is cacheable.
   *
   * @returns True if the method is cacheable, otherwise false.
   */
  isMethodCacheable (): boolean {
    return ['GET', 'HEAD'].includes(this.method)
  }

  /**
   * Generate a full URL for the given path.
   *
   * @param path - The path to append to the base URL.
   * @returns The full URL for the given path.
   */
  uriForPath (path: string): string {
    return new URL(path, this.uri).href
  }

  /**
   * Get the URI with or without the domain.
   *
   * @param withDomain - Whether to include the domain in the URI.
   * @returns The URI with or without the domain.
   */
  getUri (withDomain = false): string | undefined {
    return withDomain ? new URL(this.decodedPathname ?? '/', this.uri).href : this.decodedPathname
  }

  /**
   * Get the user instance.
   *
   * @returns The user object, resolved through a user resolver function if available.
   */
  getUser<T = undefined>(): T {
    return this.userResolver?.() as T
  }

  /**
   * Get the user resolver function.
   *
   * @returns The user resolver function.
   */
  getUserResolver (): () => unknown {
    return this.userResolver ?? (() => undefined)
  }

  /**
   * Set the user resolver function.
   *
   * @param resolver - The user resolver function.
   * @returns The current instance for method chaining.
   */
  setUserResolver (resolver: () => unknown): this {
    this.userResolver = resolver
    return this
  }

  /**
   * Get the route resolver function.
   *
   * @returns The route resolver function.
   */
  getRouteResolver (): () => IRoute | undefined {
    return this.routeResolver ?? (() => undefined)
  }

  /**
   * Set the route resolver function.
   *
   * @param resolver - The route resolver function.
   * @returns The current instance for method chaining.
   */
  setRouteResolver<RouteType extends IRoute = IRoute>(resolver: () => RouteType): this {
    this.routeResolver = resolver
    return this
  }

  /**
   * Return the current route or a route parameter.
   *
   * @returns The route parameter or the route object.
   */
  getRoute<RouteType extends IRoute = IRoute>(): RouteType | undefined {
    return this.routeResolver?.() as (RouteType | undefined)
  }

  /**
   * Generate a unique fingerprint for the event.
   *
   * @param full - Whether to include the user agent and IP address in the fingerprint.
   * @returns The generated fingerprint as a base64 string.
   */
  fingerprint (full?: boolean): string {
    return full === true
      ? btoa([this.method, this.uri, this.userAgent, this.ip].join('|'))
      : btoa([this.method, this.pathname].join('|'))
  }

  /**
   * Retrieve a parameter from the route if it exists.
   *
   * @param name - The name of the parameter to retrieve.
   * @returns The value of the parameter if it exists, otherwise undefined.
   */
  getParam<TReturn = unknown>(name: string): TReturn | undefined

  /**
   * Retrieve a parameter from the route if it exists.
   *
   * @param name - The name of the parameter to retrieve.
   * @param fallback - The fallback value if the parameter does not exist.
   * @returns The value of the parameter if it exists, otherwise undefined.
   */
  getParam<TReturn = unknown>(name: string, fallback: TReturn): TReturn

  /**
   * Retrieve a parameter from the route if it exists.
   *
   * @param name - The name of the parameter to retrieve.
   * @param fallback - The fallback value if the parameter does not exist.
   * @returns The value of the parameter if it exists, otherwise undefined.
   */
  getParam<TReturn = unknown>(name: string, fallback?: TReturn): TReturn | undefined {
    return this.getRoute()?.getParam?.(name, fallback)
  }

  /**
   * Retrieve a value from the request body.
   *
   * @param key - The key of the value to retrieve.
   * @returns The value from the body if it exists, otherwise undefined.
   */
  private getFromBody (key: string): unknown {
    return hasPath(this.body, key) ? getPath(this.body, key) : undefined
  }

  /**
   * Retrieve a value from the query parameters.
   *
   * @param key - The key of the value to retrieve.
   * @returns The value from the query parameters if it exists, otherwise undefined.
   */
  private getFromQueryParams (key: string): unknown {
    return this.query.get(key) ?? undefined
  }

  /**
   * Validate the provided name.
   *
   * @param name - The name to validate.
   * @returns True if the name is valid, otherwise false.
   */
  private isValidName (name: string): boolean {
    return typeof name === 'string' && name.trim() !== ''
  }
}
