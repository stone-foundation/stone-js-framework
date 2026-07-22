import vary from 'vary'
import mime from 'mime/lite'
import statuses from 'statuses'
import contentTypeLib from 'content-type'
import { createHash, Encoding } from 'node:crypto'
import { HttpJsonConfig } from './options/HttpConfig'
import { IncomingHttpEvent } from './IncomingHttpEvent'
import { CookieCollection } from './cookies/CookieCollection'
import { InternalServerError } from './errors/InternalServerError'
import { HTTP_NOT_ACCEPTABLE, HTTP_NOT_MODIFIED } from './constants'
import { HeadersType, IOutgoingHttpResponse, CookieOptions } from './declarations'
import { IBlueprint, OutgoingResponse, OutgoingResponseOptions, IContainer, isFunction, isString } from '@stone-js/core'

/**
 * Options for creating an Outgoing HTTP Response.
 */
export interface OutgoingHttpResponseOptions extends OutgoingResponseOptions {
  headers?: HeadersType
}

/**
 * Class representing an Outgoing HTTP Response.
 * Extends the OutgoingResponse class and provides additional features
 * such as setting headers, cookies, and interacting with IncomingHttpEvent.
 */
export class OutgoingHttpResponse extends OutgoingResponse implements IOutgoingHttpResponse {
  static readonly OUTGOING_HTTP_RESPONSE = 'stonejs@outgoing_http_response'

  protected _charset?: Encoding
  protected _formats?: Record<string, () => unknown>
  protected _incomingEventResolver?: () => IncomingHttpEvent
  protected _blueprintResolver?: () => IBlueprint | undefined

  protected readonly _headers: Headers
  protected readonly _cookieCollection: CookieCollection

  /**
   * Create an instance of OutgoingHttpResponse.
   *
   * @param options - Options for the outgoing HTTP response.
   * @returns A new instance of OutgoingHttpResponse.
   */
  static create<T extends OutgoingHttpResponse = OutgoingHttpResponse>(options: OutgoingHttpResponseOptions): T {
    return new this(options) as T
  }

  /**
   * Constructor for OutgoingHttpResponse.
   * Initializes headers and cookies based on the provided options.
   *
   * @param options - Options for the outgoing HTTP response.
   */
  constructor (options: OutgoingHttpResponseOptions) {
    super({ ...options, type: OutgoingHttpResponse.OUTGOING_HTTP_RESPONSE })
    this._headers = new Headers()
    this._cookieCollection = CookieCollection.create()

    this
      .setHeaders(options.headers ?? {})
      .setStatus(options.statusCode ?? 200)
  }

  /**
   * Get the HTTP status code.
   *
   * @returns The HTTP status code.
   */
  get status (): number | undefined {
    return this.statusCode
  }

  /**
   * Get the headers of the response.
   *
   * @returns The headers of the response as a Headers object.
   */
  get headers (): Headers {
    return this._headers
  }

  /**
   * Get the character set encoding.
   * Defaults to 'utf-8' if not explicitly set.
   *
   * @returns The character set encoding.
   */
  get charset (): Encoding {
    return this._charset ?? 'utf-8'
  }

  /**
   * Get the ETag of the response.
   *
   * @returns The value of the ETag header, if present.
   */
  get etag (): string | undefined {
    return this.getHeader('ETag')
  }

  /**
   * Get the Vary header as an array of values.
   *
   * @returns The Vary header values split by comma, or undefined if not present.
   */
  get vary (): string[] | undefined {
    return this.getHeader('Vary', '')?.split(/[\s,]+/)
  }

  /**
   * Get the Last-Modified date of the response.
   *
   * @returns The value of the Last-Modified header, if present.
   */
  get lastModified (): string | undefined {
    return this.getHeader('Last-Modified')
  }

  /**
   * Get the associated IncomingHttpEvent.
   *
   * @throws InternalServerError if the IncomingHttpEvent resolver is not set.
   * @returns The associated IncomingHttpEvent.
   */
  get incomingEvent (): IncomingHttpEvent {
    if (this._incomingEventResolver === undefined) {
      throw new InternalServerError('Must set an IncomingHttpEvent resolver.')
    }
    return this._incomingEventResolver()
  }

  /**
   * Get the blueprint associated with the response.
   *
   * @returns The blueprint or undefined if not set.
   */
  get blueprint (): IBlueprint | undefined {
    return this._blueprintResolver?.()
  }

  /**
   * Get the regular expression for matching charset in content type.
   *
   * @protected
   * @returns The regular expression for matching charset in content type.
   */
  protected get charsetRegExp (): RegExp {
    return /;\s*charset\s*=/
  }

  /**
   * Set multiple headers for the response.
   *
   * @param values - A key-value pair of headers to be set.
   * @returns The current instance of OutgoingHttpResponse for chaining.
   */
  setHeaders (values: HeadersType): this {
    const headers = values instanceof Headers || values instanceof Map ? Array.from(values.entries()) : Object.entries(values)
    headers.forEach(([key, value]) => this.setHeader(key, value))
    return this
  }

  /**
   * Set a single header for the response.
   * If the header is "Content-Type," ensures charset is set appropriately.
   *
   * @param key - The header name.
   * @param value - The value of the header.
   * @returns The current instance of OutgoingHttpResponse for chaining.
   */
  setHeader (key: string, value: string | string[]): this {
    if (Array.isArray(value)) {
      // Append each element via the native Headers.append (keeps multiple Set-Cookie separate and
      // merges other multi-value headers like Vary).
      value.forEach((v) => this.appendHeader(key, v))
    } else if (key.toLowerCase() === 'content-type') {
      this.ensureCharset(value)
    } else {
      this._headers.set(key, value)
    }
    return this
  }

  /**
   * Append a value to an existing header or create a new header.
   *
   * @param key - The header name.
   * @param value - The value to append.
   * @returns The current instance of OutgoingHttpResponse for chaining.
   */
  appendHeader (key: string, value: string): this {
    // Delegate to the native Headers.append: it correctly keeps repeated `Set-Cookie` entries
    // separate (retrievable via getSetCookie) and combines other headers with `", "`. The old
    // manual concat corrupted cookies whose serialized value contains commas (e.g. `Expires`).
    this._headers.append(key, value)
    return this
  }

  /**
   * Get a header value.
   *
   * @param name - The header name.
   * @returns The header value or the fallback value.
   */
  getHeader<TReturn = string>(name: string): TReturn | undefined

  /**
   * Get a header value.
   *
   * @param name - The header name.
   * @param fallback - A fallback value if the header is not found.
   * @returns The header value or the fallback value.
   */
  getHeader<TReturn = string>(name: string, fallback: TReturn): TReturn

  /**
   * Get a header value.
   *
   * @param name - The header name.
   * @param fallback - A fallback value if the header is not found.
   * @returns The header value or the fallback value.
   */
  getHeader<TReturn = string>(name: string, fallback?: TReturn): TReturn | undefined {
    return (this._headers.get(name) ?? fallback) as TReturn | undefined
  }

  /**
   * Get all header names.
   *
   * @returns An array of all header names.
   */
  getHeaderNames (): string[] {
    return Array.from(this._headers.keys())
  }

  /**
   * Check if a specific header exists.
   *
   * @param key - The header name to check.
   * @returns True if the header exists, false otherwise.
   */
  hasHeader (key: string): boolean {
    return this._headers.has(key)
  }

  /**
   * Remove headers from the response.
   *
   * @param key - The header or headers to be removed.
   * @returns The current instance of OutgoingHttpResponse for chaining.
   */
  removeHeader (key: string | string[]): this {
    ([] as string[]).concat(key).forEach((header) => this._headers.delete(header))
    return this
  }

  /**
   * Set the HTTP status code of the response.
   * Also sets a default status message if none is provided.
   *
   * @param code - The HTTP status code.
   * @param text - Optional status message.
   * @returns The current instance of OutgoingHttpResponse for chaining.
   * @throws InternalServerError if the status code is invalid.
   */
  setStatus (code: number, text?: string): this {
    if (code < 100 || code >= 600) {
      throw new InternalServerError(`The HTTP status code "${code}" is not valid.`)
    }
    this._statusCode = code
    this._statusMessage = text ?? statuses.message[code] ?? 'unknown status'
    return this
  }

  /**
   * Set the response content.
   * If the content should be JSON, it will be converted appropriately.
   *
   * @param value - The content to set.
   * @param options - The JSON options.
   * @returns The current instance of OutgoingHttpResponse for chaining.
   */
  setContent (value: unknown, options: Partial<HttpJsonConfig> = {}): this {
    this._content = this.shouldBeJson(value) ? this.morphToJson(value, options) : value ?? ''
    return this
  }

  /**
   * Set a cookie for the response.
   *
   * @param name - The name of the cookie.
   * @param value - The value of the cookie.
   * @param options - Optional settings for the cookie.
   * @returns The current instance of OutgoingHttpResponse for chaining.
   */
  setCookie (name: string, value: unknown, options: CookieOptions = {}): this {
    if (!isString(name)) { throw new InternalServerError('Cookie name must be a non-empty string.') }
    this._cookieCollection.add(name, value, options)
    return this
  }

  /**
   * Clear a specific cookie from the response.
   *
   * @param name - The name of the cookie to be cleared.
   * @param options - Optional settings for the cookie.
   * @param force - Whether to force the removal of the cookie, even if it doesn't exist.
   * @returns The current instance of OutgoingHttpResponse for chaining.
   */
  clearCookie (name: string, options: CookieOptions = {}, force = false): this {
    if (!isString(name)) { throw new InternalServerError('Cookie name must be a non-empty string.') }
    this._cookieCollection.remove(name, options, force)
    return this
  }

  /**
   * Clear all cookies from the response.
   *
   * @param force - Whether to force the removal of all cookies.
   * @returns The current instance of OutgoingHttpResponse for chaining.
   */
  clearCookies (force = false): this {
    this._cookieCollection.clear(force)
    return this
  }

  /**
   * Secure all cookies by setting the "Secure" attribute.
   *
   * @param value - Whether to set or unset the "Secure" attribute for cookies.
   * @returns The current instance of OutgoingHttpResponse for chaining.
   */
  secureCookies (value = true): this {
    this._cookieCollection.secure(value)
    return this
  }

  /**
   * Set the character set for the response.
   *
   * @param value - The character encoding to use.
   * @returns The current instance of OutgoingHttpResponse for chaining.
   */
  setCharset (value: string): this {
    this._charset = value as BufferEncoding
    return this
  }

  /**
   * Set the content type of the response.
   *
   * @param value - The MIME type for the response.
   * @returns The current instance of OutgoingHttpResponse for chaining.
   * @throws InternalServerError if the provided MIME type is invalid.
   */
  setContentType (value: string): this {
    const mimeType = isString(value) && value.includes('/') ? value : mime.getType(value) ?? undefined
    if (mimeType !== undefined) {
      return this.setHeader('Content-Type', mimeType)
    } else {
      throw new InternalServerError(`Invalid MIME type: ${value}`)
    }
  }

  /**
   * Set the content type by file extension.
   *
   * @param value - The file extension.
   * @returns The current instance of OutgoingHttpResponse for chaining.
   */
  setType (value: string): this {
    return this.setContentType(value)
  }

  /**
   * Set link headers for the response.
   *
   * @param links - An object representing links to set.
   * @returns The current instance of OutgoingHttpResponse for chaining.
   */
  setLinks (links: Record<string, string>): this {
    const linkHeader = Object.entries(links)
      .map(([key, val]) => `<${val}>; rel="${key}"`)
      .join(', ')
    return this.setHeader('Link', linkHeader)
  }

  /**
   * Handles content negotiation based on the `Accept` header of the incoming request.
   *
   * @param formats - An object where keys are MIME types and values are functions that return the content for that MIME type.
   * @returns The current instance of OutgoingHttpResponse for chaining.
   */
  format (formats: Record<string, () => unknown>): this {
    this._formats = formats
    return this
  }

  /**
   * Add a field to the Vary header.
   *
   * @param field - The field to add to the Vary header.
   * @returns The current instance of OutgoingHttpResponse for chaining.
   */
  addVary (field: string | string[]): this {
    vary(this as any, field)
    return this
  }

  /**
   * Set the ETag for the response.
   *
   * @param etag - The ETag value to set.
   * @param weak - Whether the ETag should be marked as weak.
   * @returns The current instance of OutgoingHttpResponse for chaining.
   */
  setEtag (etag?: string, weak = false): this {
    if (etag === undefined) {
      this.removeHeader('ETag')
    } else {
      const formattedEtag = etag.startsWith('"') ? etag : `"${etag}"`
      this.setHeader('ETag', `${weak ? 'W/' : ''}${formattedEtag}`)
    }
    return this
  }

  /**
   * Set the Last-Modified header for the response.
   *
   * @param date - The date to set as the Last-Modified header.
   * @returns The current instance of OutgoingHttpResponse for chaining.
   */
  setLastModified (date?: Date): this {
    if (date === undefined) {
      this.removeHeader('Last-Modified')
    } else {
      this.setHeader('Last-Modified', date.toUTCString())
    }
    return this
  }

  /**
   * Set the resolver for the incoming HTTP event.
   *
   * @param resolver - A function that returns the incoming HTTP event.
   * @returns The current instance of OutgoingHttpResponse for chaining.
   */
  setIncomingEventResolver (resolver: () => IncomingHttpEvent): this {
    this._incomingEventResolver = resolver
    return this
  }

  /**
   * Set the resolver for the blueprint.
   *
   * @param resolver - A function that returns the blueprint.
   * @returns The current instance of OutgoingHttpResponse for chaining.
   */
  setBlueprintResolver (resolver: () => IBlueprint | undefined): this {
    this._blueprintResolver = resolver
    return this
  }

  /**
   * Check if the status code falls within the specified range.
   *
   * @param start - The starting value of the range (inclusive).
   * @param end - The ending value of the range (exclusive).
   * @returns True if the status code is within the specified range, otherwise false.
   */
  isInStatusRange (start: number, end: number): boolean {
    const code = this.statusCode ?? 500
    return code >= start && code < end
  }

  /**
   * Check if the status code is invalid.
   *
   * @returns True if the status code is invalid, otherwise false.
   */
  isInvalid (): boolean {
    const code = this.statusCode ?? 500
    return code < 100 || code >= 600
  }

  /**
   * Check if the status code represents an informational response (1xx).
   *
   * @returns True if the status code is informational, otherwise false.
   */
  is1xx (): boolean {
    return this.isInStatusRange(100, 200)
  }

  /**
   * Check if the status code represents a successful response (2xx).
   *
   * @returns True if the status code is successful, otherwise false.
   */
  is2xx (): boolean {
    return this.isInStatusRange(200, 300)
  }

  /**
   * Check if the status code represents a redirection response (3xx).
   *
   * @returns True if the status code is a redirection, otherwise false.
   */
  is3xx (): boolean {
    return this.isInStatusRange(300, 400)
  }

  /**
   * Check if the status code represents a client error response (4xx).
   *
   * @returns True if the status code is a client error, otherwise false.
   */
  is4xx (): boolean {
    return this.isInStatusRange(400, 500)
  }

  /**
   * Check if the status code represents a server error response (5xx).
   *
   * @returns True if the status code is a server error, otherwise false.
   */
  is5xx (): boolean {
    return this.isInStatusRange(500, 600)
  }

  /**
   * Check if the status code is not an error (i.e., not 4xx or 5xx).
   *
   * @returns True if the status code is not an error, otherwise false.
   */
  isNotError (): boolean {
    return !this.isError()
  }

  /**
   * Check if the status code is an error (i.e., 4xx or 5xx).
   *
   * @returns True if the status code is an error, otherwise false.
   */
  isError (): boolean {
    return this.is4xx() || this.is5xx()
  }

  /**
   * Check if the status code is 200 (OK).
   *
   * @returns True if the status code is 200, otherwise false.
   */
  isOk (): boolean {
    return this.statusCode === 200
  }

  /**
   * Check if the status code is 205 (Reset Content).
   *
   * @returns True if the status code is 205, otherwise false.
   */
  isResetContent (): boolean {
    return this.statusCode === 205
  }

  /**
   * Check if the response is empty.
   *
   * @returns True if the status code indicates an empty response, otherwise false.
   */
  isEmpty (): boolean {
    return [204, 304].includes(this.statusCode ?? 500)
  }

  /**
   * Check if the response is a redirect.
   *
   * @param location - The optional location to check for redirection.
   * @returns True if the status code indicates a redirect, otherwise false.
   */
  isRedirect (location?: string): boolean {
    const code = this.statusCode ?? 500
    return [301, 302, 303, 307, 308].includes(code) && (location === undefined || this.getHeader('Location') === undefined)
  }

  /**
   * Check if the status code is 301 (Moved Permanently).
   *
   * @returns True if the status code is 301, otherwise false.
   */
  isMovedPermanently (): boolean {
    return this.statusCode === 301
  }

  /**
   * Check if the status code is 401 (Unauthorized).
   *
   * @returns True if the status code is 401, otherwise false.
   */
  isUnauthorized (): boolean {
    return this.statusCode === 401
  }

  /**
   * Check if the status code is 403 (Forbidden).
   *
   * @returns True if the status code is 403, otherwise false.
   */
  isForbidden (): boolean {
    return this.statusCode === 403
  }

  /**
   * Check if the status code is 404 (Not Found).
   *
   * @returns True if the status code is 404, otherwise false.
   */
  isNotFound (): boolean {
    return this.statusCode === 404
  }

  /**
   * Check if the response is validateable.
   *
   * @returns True if the response has Last-Modified or ETag headers, otherwise false.
   */
  isValidateable (): boolean {
    return this.hasHeader('Last-Modified') || this.hasHeader('ETag')
  }

  /**
   * Prepare the response before sending.
   *
   * @param event - The incoming HTTP event.
   * @param container - The service container.
   * @returns The current instance of the response for chaining.
   */
  prepare (event: IncomingHttpEvent, container?: IContainer): this | Promise<this> {
    const blueprint = container?.make<IBlueprint>('blueprint')
    const jsonConfig = blueprint?.get('stone.http.json', {}) ?? {}
    return this
      .setBlueprintResolver(() => blueprint)
      .setIncomingEventResolver(() => event)
      .handleContentNegotiation()
      .prepareCookies()
      .setContentTypeIfNeeded()
      .setContent(this.content, jsonConfig) // Important Must be called after setContentTypeIfNeeded and before prepareContentHeaders
      .handleCacheHeaders()
      .prepareContentHeaders()
      .setPrepared(true)
  }

  /**
   * Handles content negotiation based on the `Accept` header of the incoming request.
   *
   * @returns The current instance of OutgoingHttpResponse for chaining.
   */
  protected handleContentNegotiation (): this {
    if (this._formats === undefined) return this

    const types = Object.keys(this._formats).filter(v => v !== 'default')
    const type = types.length > 0 ? this.incomingEvent.acceptsTypes(...types) : undefined

    if (isString(type) && this._formats[type] !== undefined) {
      this.setContentType(type).setContent(this._formats[type]())
    } else if (this._formats.default !== undefined) {
      this.setContent(this._formats.default())
    } else {
      this.setStatus(HTTP_NOT_ACCEPTABLE).setContent(`Invalid types (${types.join(',')})`)
    }

    return this.addVary('Accept')
  }

  /**
   * Set the content type if it's not already set.
   *
   * @returns The current instance of the response for chaining.
   */
  protected setContentTypeIfNeeded (): this {
    // Skip setting content type for empty responses or responses with no content
    if (this.statusCode === 204 || this.content === undefined || this.content === null) {
      return this.removeHeader('Content-Type')
    }

    if (!this.hasHeader('Content-Type')) {
      if (Buffer.isBuffer(this.content)) {
        this.setContentType('bin')
      } else if (typeof this.content === 'object' && this.content !== null) {
        this.setContentType('json')
      } else if (typeof this.content === 'string') {
        if (/^\s{0,50}<(?:!DOCTYPE|html|body|div|span|head|script|style|meta|title)\b/i.test(this.content)) {
          this.setContentType('html')
        } else {
          this.setContentType('txt')
        }
      } else if (typeof this.content === 'number' || typeof this.content === 'boolean') {
        this.setContentType('txt')
      } else {
        // Default to application/octet-stream for unknown content types
        this.setContentType('application/octet-stream')
      }
    }
    return this
  }

  /**
   * Handle cache headers like ETag and Last-Modified.
   *
   * @returns The current instance of the response for chaining.
   */
  protected handleCacheHeaders (): this {
    if (this.incomingEvent.isFresh(this)) {
      this.setStatus(HTTP_NOT_MODIFIED)
    }
    return this
  }

  /**
   * Prepare content-related headers such as Content-Length and ETag.
   *
   * @returns The current instance of the response for chaining.
   */
  protected prepareContentHeaders (): this {
    if (this.is1xx() || this.isEmpty()) {
      this.setContent(undefined).removeHeader(['Content-Type', 'Content-Length', 'Transfer-Encoding'])
    } else if (this.isResetContent()) {
      this.setContent(undefined).setHeader('Content-Length', '0').removeHeader('Transfer-Encoding')
    } else {
      this.setContentHeaders()
    }
    return this
  }

  /**
   * Set content headers such as Content-Length and ETag.
   *
   * @returns The current instance of the response for chaining.
   */
  protected setContentHeaders (): this {
    let length = 0
    const type = this.getHeader('Content-Type')
    const etagFn = this.blueprint?.get('stone.http.etag.function', this.defaultEtagFn.bind(this))
    const generateETag = !this.hasHeader('ETag') && isFunction(etagFn)

    if (isString(this.content) && isString(type) && !this.charsetRegExp.test(type)) {
      this.setContentType(`${type}; charset=${String(this.charset)}`)
    }

    if (this.content !== undefined) {
      length = this.calculateContentLength()
      this.setHeader('Content-Length', String(length))
    }

    if (generateETag && length > 0) {
      this.setEtag(etagFn(String(this.content), this.charset))
    }

    if (this.hasHeader('Transfer-Encoding')) {
      this.removeHeader('Content-Length')
    }

    if (this.incomingEvent.isMethod('HEAD')) {
      this.setContent(undefined)
    }

    return this
  }

  /**
   * Calculate the content length.
   *
   * @returns The content length.
   */
  protected calculateContentLength (): number {
    let data: string

    if (Buffer.isBuffer(this.content)) {
      return this.content.length
    } else if (typeof this.content === 'string') {
      data = this.content
    } else if (typeof this.content === 'object' && this.content !== null) {
      data = this.morphToJson(this.content, this.blueprint?.get('stone.http.json', {}))
    } else if (typeof this.content === 'number' || typeof this.content === 'boolean') {
      data = String(this.content)
    } else {
      data = ''
    }

    return Buffer.byteLength(data)
  }

  /**
   * Ensure that the "Content-Type" header has a charset specified.
   *
   * @param value - The "Content-Type" header value.
   * @returns The current instance of OutgoingHttpResponse for chaining.
   */
  protected ensureCharset (value: string): this {
    if (!this.charsetRegExp.test(value)) {
      const type = value?.split(';')?.shift() ?? 'text/html'
      this
        .setCharset(contentTypeLib.parse(type.trim()).parameters.charset ?? 'UTF-8')
        .setContentType(`${type}; charset=${this.charset.toLowerCase()}`)
    } else {
      this._headers.set('Content-Type', value)
    }

    return this
  }

  /**
   * Determine if the content should be serialized as JSON.
   *
   * @param content - The content to check.
   * @returns True if the content should be serialized as JSON, otherwise false.
   */
  protected shouldBeJson (content: unknown): boolean {
    return (
      typeof content === 'object' &&
      content !== null &&
      !Buffer.isBuffer(content) &&
      !ArrayBuffer.isView(content)
    )
  }

  /**
   * Convert the given content to a JSON string.
   *
   * @param content - The content to convert.
   * @param options - Options to customize the serialization process.
   * @returns A JSON string representation of the content.
   * @throws InternalServerError if the content cannot be converted to JSON.
   */
  protected morphToJson (content: unknown, options: Partial<HttpJsonConfig> = {}): string {
    try {
      return this.stringify(content, options.replacer, options.spaces, options.escape)
    } catch (error: any) {
      throw new InternalServerError(error.message, { cause: error })
    }
  }

  /**
   * Prepare cookies by setting the appropriate headers.
   *
   * @returns The current instance of the response for chaining.
   */
  protected prepareCookies (): this {
    if (!this._cookieCollection.isEmpty()) {
      this._cookieCollection
        // Read the cookie secret from the dedicated key first, falling back to the app-wide
        // secret — the SAME resolution the adapters use to read incoming cookies, so outgoing and
        // incoming signatures always use the same key.
        .setSecret(this.blueprint?.get('stone.http.cookie.secret') ?? this.blueprint?.get('stone.secret') ?? '')
        .setOptions(this.blueprint?.get('stone.http.cookie.options') ?? {})

      if (this.incomingEvent.isSecure) {
        this.secureCookies(true)
      }

      this.setHeader('Set-Cookie', this._cookieCollection.all(true))
    }

    return this
  }

  /**
   * Generate a default ETag for the given content.
   *
   * @param content - The content to generate an ETag for.
   * @param encoding - The encoding to use.
   * @returns The generated ETag as a base64 string.
   */
  protected defaultEtagFn (content: string, encoding: Encoding): string {
    return Buffer.from(this.getHashedContent(content, encoding)).toString('base64')
  }

  /**
   * Get the hashed content using the specified encoding.
   *
   * @param content - The content to hash.
   * @param encoding - The encoding to use for hashing.
   * @returns The hashed content as a hexadecimal string.
   */
  protected getHashedContent (content: string, encoding: Encoding): string {
    return createHash('sha256').update(content, encoding).digest('hex')
  }

  /**
   * Convert the given value to a JSON string with optional escaping.
   *
   * @param value - The value to convert.
   * @param replacer - A function or array that alters the behavior of the stringification process.
   * @param spaces - The number of spaces to use for pretty-printing the JSON string.
   * @param escape - Whether to escape special characters.
   * @returns The JSON string representation of the value.
   */
  protected stringify (
    value: unknown,
    replacer?: HttpJsonConfig['replacer'],
    spaces?: string,
    escape?: boolean
  ): string {
    const json = JSON.stringify(value, replacer, spaces)

    if (escape === true) {
      return json.replace(/[<>&]/g, (c) => ({ '<': String.raw`\u003c`, '>': String.raw`\u003e`, '&': String.raw`\u0026` }[c]) as string)
    }

    return json
  }
}
