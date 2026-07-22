import { Cookie } from './cookies/Cookie'
import { HttpMethod, IRoute } from './declarations'
import { BrowserError } from './errors/BrowserError'
import { CookieCollection } from './cookies/CookieCollection'
import { IncomingEvent, IncomingEventOptions } from '@stone-js/core'

/**
 * IncomingBrowserEventOptions interface.
 */
export interface IncomingBrowserEventOptions extends IncomingEventOptions {
  url: URL
  protocol?: string
  queryString?: string
  cookies?: CookieCollection
}

/**
 * Class representing an IncomingBrowserEvent.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 */
export class IncomingBrowserEvent extends IncomingEvent {
  static INCOMING_BROWSER_EVENT = 'stonejs@incoming_browser_event'

  /** The URL of the request. */
  public readonly url: URL
  /** The query parameters of the request. */
  public readonly query: URLSearchParams
  /** The HTTP method of the request. */
  public readonly method: HttpMethod
  /** The cookies included in the request. */
  public readonly cookies: CookieCollection
  /** The protocol used for the request (e.g., http or https). */
  public readonly protocol: string
  /** The query string of the request. */
  public readonly queryString?: string

  protected userResolver?: () => unknown
  protected routeResolver?: () => IRoute

  /**
   * Create an IncomingBrowserEvent.
   *
   * @param options - The IncomingBrowserEvent options.
   * @returns A new instance of IncomingBrowserEvent.
   */
  static create (options: IncomingBrowserEventOptions): IncomingBrowserEvent {
    return new IncomingBrowserEvent(options)
  }

  /**
   * Constructor for IncomingBrowserEvent.
   *
   * @param options - The options to create an IncomingBrowserEvent instance.
   * @throws {BrowserError} If the URL option is not a valid instance of URL.
   */
  protected constructor ({
    url,
    source,
    locale = 'en',
    metadata = {},
    protocol = 'http',
    cookies = undefined,
    queryString = undefined
  }: IncomingBrowserEventOptions) {
    super({ type: IncomingBrowserEvent.INCOMING_BROWSER_EVENT, source, metadata, locale })

    if (!(url instanceof URL)) {
      throw new BrowserError('The `url` option must be an instance of `URL`.')
    }

    this.url = url
    this.method = 'GET'
    this.protocol = protocol
    // Prefer the explicit queryString, but fall back to the URL's own query so `event.query` is
    // never empty when a caller passes a URL carrying `?a=1` without a separate queryString
    // (previously `query` and `path` disagreed).
    this.queryString = queryString ?? url.search
    this.cookies = cookies ?? CookieCollection.create()
    this.query = new URLSearchParams(this.queryString)
  }

  /** @returns The decoded pathname of the URL. */
  get decodedPathname (): string | undefined {
    try {
      return decodeURIComponent(this.url.pathname)
    } catch (_) {
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

  /** @returns The user agent, or undefined outside a browser (SSR/tests/workers). */
  get userAgent (): string | undefined {
    // Guard the global so the event object stays constructible/readable in any context (the
    // Continuum promise): a bare `window.navigator` throws under SSR/Node.
    return typeof window !== 'undefined' ? window.navigator?.userAgent : undefined
  }

  /**
   * Get data from the request.
   *
   * Priority:
   * 1. Route params
   * 2. Query params
   * 3. Cookies
   * 4. Metadata
   * 5. Fallback value
   *
   * @param key - The key to look for.
   * @returns The value of the key or the fallback.
  */
  get<TReturn = unknown>(key: string): TReturn | undefined

  /**
   * Get data from the request.
   *
   * Priority:
   * 1. Route params
   * 2. Query params
   * 3. Cookies
   * 4. Metadata
   * 5. Fallback value
   *
   * @param key - The key to look for.
   * @param fallback - A fallback value if the key is not found.
   * @returns The value of the key or the fallback.
  */
  get<TReturn = unknown>(key: string, fallback: TReturn): TReturn

  /**
   * Get data from the request.
   *
   * Priority:
   * 1. Route params
   * 2. Query params
   * 3. Cookies
   * 4. Metadata
   * 5. Fallback value
   *
   * @param key - The key to look for.
   * @param fallback - A fallback value if the key is not found.
   * @returns The value of the key or the fallback.
  */
  get<TReturn = unknown>(key: string, fallback?: TReturn): TReturn | undefined {
    return (
      this.getParam(key) ??
      this.getFromQueryParams(key) ??
      this.getFromCookies(key) ??
      this.getMetadataValue(key, fallback)
    ) as TReturn | undefined
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
    if (!this.isValidName(name)) { throw new BrowserError('Cookie name must be a non-empty string.') }
    return (this.cookies.get(name) ?? this.cookies.get(name.toLowerCase()) ?? fallback) as TReturn | undefined
  }

  /**
   * Check if a cookie exists.
   *
   * @param name - The cookie name to check.
   * @returns True if the cookie exists, otherwise false.
   */
  hasCookie (name: string): boolean {
    if (!this.isValidName(name)) { throw new BrowserError('Cookie name must be a non-empty string.') }
    return this.cookies.has(name) || this.cookies.has(name.toLowerCase())
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
   * Check if the current event method matches the given method.
   *
   * @param method - The method to check.
   * @returns True if the event method matches, otherwise false.
   */
  isMethod (method: string): boolean {
    return this.method.toUpperCase() === method.toUpperCase()
  }

  /**
   * Generate a unique fingerprint for the event.
   *
   * @returns The generated fingerprint as a base64 string.
   */
  fingerprint (): string {
    // Include the full path (pathname + search) so distinct navigations don't collide, and
    // base64-encode UTF-8 bytes so non-latin1 paths don't throw (bare `btoa` only accepts latin1).
    const raw = [this.method, this.path].join('|')
    /* v8 ignore next 3 */ // The browser btoa branch can't run under the Node test runtime (Buffer always defined).
    return typeof Buffer !== 'undefined'
      ? Buffer.from(raw, 'utf-8').toString('base64')
      : btoa(String.fromCodePoint(...new TextEncoder().encode(raw)))
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
   * Retrieve a value from the cookies.
   *
   * @param key - The name of the cookie to retrieve.
   * @returns The value of the cookie if it exists, otherwise undefined.
   */
  private getFromCookies (key: string): unknown {
    return this.getCookie(key)?.value ?? undefined
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
