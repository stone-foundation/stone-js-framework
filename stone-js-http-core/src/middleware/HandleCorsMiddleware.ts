import { HttpCorsConfig } from '../options/HttpConfig'
import { IncomingHttpEvent } from '../IncomingHttpEvent'
import { OutgoingHttpResponse } from '../OutgoingHttpResponse'
import { IBlueprint, isNotEmpty, isEmpty, NextMiddleware, type MetaMiddleware } from '@stone-js/core'

/**
 * Kernel Middleware for adding Cross-Origin Resource Sharing (CORS) headers to HTTP responses.
 * It allows controlling how clients from different origins can access the server's resources.
 *
 * @template TEvent - Represents the type of the incoming HTTP event.
 * @template UResponse - Represents the type of the outgoing HTTP response.
 * @author Mr. Stone <evensstone@gmail.com>
 */
export class HandleCorsMiddleware {
  private readonly headers: Headers
  private readonly headerVary: string[]
  private readonly blueprint: IBlueprint

  /**
   * Construct an instance of HandleCorsMiddleware.
   *
   * @param blueprint - The configuration blueprint used for managing CORS settings.
   */
  constructor ({ blueprint }: { blueprint: IBlueprint }) {
    this.headerVary = []
    this.blueprint = blueprint
    this.headers = new Headers()
  }

  /**
   * Handle CORS by modifying the response headers based on the configuration.
   *
   * @param event - The incoming HTTP event.
   * @param next - The next middleware function to continue processing the event.
   * @returns The outgoing HTTP response with CORS headers.
   */
  async handle (event: IncomingHttpEvent, next: NextMiddleware<IncomingHttpEvent, OutgoingHttpResponse>): Promise<OutgoingHttpResponse> {
    const options = this.getOptions()
    const response = await next(event)

    this
      .configureCredentials(options)
      .configureExposedHeaders(options)
      .configureOrigin(options, event)

    if (event.isMethod('OPTIONS')) {
      this
        .configureMaxAge(options)
        .configureMethods(options)
        .configureAllowedHeaders(options, event)

      if (options.preflightStop === true && isNotEmpty(response)) {
        response
          .addVary(this.headerVary)
          .setHeaders(this.headers)
          .setHeader('Content-Length', '0')
          .setStatus(options.successStatus ?? 204)
        return response
      }
    }

    if (isNotEmpty(response)) {
      response
        .addVary(this.headerVary)
        .setHeaders(this.headers)
    }

    return response
  }

  /**
   * Get the CORS options by merging the blueprint configuration with defaults.
   *
   * @returns The merged CORS options.
   */
  private getOptions (): Partial<HttpCorsConfig> {
    return { ...this.getDefaults(), ...this.blueprint.get('stone.http.cors', {}) }
  }

  /**
   * Check if the given origin is allowed based on the provided configuration.
   *
   * @param origin - The origin to check.
   * @param allowedOrigin - The allowed origins configuration.
   * @returns Whether the origin is allowed.
   */
  private isOriginAllowed (origin: string, allowedOrigin: unknown): boolean {
    if (Array.isArray(allowedOrigin)) {
      return allowedOrigin.reduce((prev, curr) => this.isOriginAllowed(origin, curr) || prev, false)
    } else if (typeof allowedOrigin === 'string') {
      return origin === allowedOrigin
    } else {
      return allowedOrigin === undefined
    }
  }

  /**
   * Configure the `Access-Control-Allow-Origin` header based on the event origin and CORS options.
   *
   * @param {origin} HttpCorsConfig - The CORS options.
   * @param event - The incoming event.
   * @returns The middleware instance for method chaining.
   */
  private configureOrigin ({ origin, credentials }: Partial<HttpCorsConfig>, event: IncomingHttpEvent): this {
    // Explicit wildcard: allowed, but never with credentials (browsers reject it, and it would
    // expose credentialed responses to any site). Fail loud on the misconfiguration.
    if (origin === '*') {
      if (credentials === true) {
        throw new Error(
          'CORS misconfiguration: `origin: "*"` cannot be combined with `credentials: true`. ' +
          'List the exact allowed origins instead.'
        )
      }
      this.setHeader('Access-Control-Allow-Origin', '*')
      return this
    }

    // Unconfigured (empty): stay same-origin — emit NO Access-Control-Allow-Origin header so the
    // browser enforces the same-origin policy. An unconfigured app is never opened cross-origin.
    if (isEmpty(origin)) {
      return this
    }

    // A single configured origin.
    if (typeof origin === 'string') {
      this.addVary('Origin').setHeader('Access-Control-Allow-Origin', origin)
      return this
    }

    // An allow-list: reflect the request origin only when it matches; otherwise emit no header.
    const reqOrigin = event.getHeader<string>('origin', '')
    this.addVary('Origin')
    if (isNotEmpty<string>(reqOrigin) && this.isOriginAllowed(reqOrigin, origin)) {
      this.setHeader('Access-Control-Allow-Origin', reqOrigin)
    }

    return this
  }

  /**
   * Configure the `Access-Control-Allow-Methods` header based on the CORS options.
   *
   * @param {methods} HttpCorsConfig - The CORS options.
   * @returns The middleware instance for method chaining.
   */
  private configureMethods ({ methods }: Partial<HttpCorsConfig>): this {
    let allowMethods: string
    if (Array.isArray(methods)) {
      allowMethods = isNotEmpty(methods) ? methods.join(',') : '*'
    } else {
      allowMethods = methods ?? '*'
    }

    return this.setHeader('Access-Control-Allow-Methods', allowMethods)
  }

  /**
   * Configure the `Access-Control-Allow-Credentials` header if allowed.
   *
   * @param {credentials} HttpCorsConfig - The CORS options.
   * @returns The middleware instance for method chaining.
   */
  private configureCredentials ({ credentials }: Partial<HttpCorsConfig>): this {
    return credentials === true ? this.setHeader('Access-Control-Allow-Credentials', 'true') : this
  }

  /**
   * Configure the `Access-Control-Allow-Headers` header based on the event headers and CORS options.
   *
   * @param {allowedHeaders} HttpCorsConfig - The CORS options.
   * @param event - The incoming event.
   * @returns The middleware instance for method chaining.
   */
  private configureAllowedHeaders ({ allowedHeaders }: Partial<HttpCorsConfig>, event: IncomingHttpEvent): this {
    if (Array.isArray(allowedHeaders) && allowedHeaders.length > 0) {
      allowedHeaders = allowedHeaders.join(',')
    } else {
      this.addVary('Access-Control-Request-Headers')
      allowedHeaders = event.getHeader('access-control-request-headers')
    }

    if (isNotEmpty<string>(allowedHeaders) && typeof allowedHeaders === 'string') {
      this.setHeader('Access-Control-Allow-Headers', allowedHeaders)
    }

    return this
  }

  /**
   * Configure the `Access-Control-Expose-Headers` header based on the CORS options.
   *
   * @param {exposedHeaders} HttpCorsConfig - The CORS options.
   * @returns The middleware instance for method chaining.
   */
  private configureExposedHeaders ({ exposedHeaders }: Partial<HttpCorsConfig>): this {
    if (Array.isArray(exposedHeaders)) {
      exposedHeaders = exposedHeaders.join(',')
    }

    if (isNotEmpty<string>(exposedHeaders)) {
      this.setHeader('Access-Control-Expose-Headers', exposedHeaders)
    }

    return this
  }

  /**
   * Configure the `Access-Control-Max-Age` header if provided in the CORS options.
   *
   * @param {maxAge} HttpCorsConfig - The CORS options.
   * @returns The middleware instance for method chaining.
   */
  private configureMaxAge ({ maxAge }: Partial<HttpCorsConfig>): this {
    const newMaxAge = String(maxAge)

    if (isNotEmpty<string>(newMaxAge)) {
      this.setHeader('Access-Control-Max-Age', newMaxAge)
    }

    return this
  }

  /**
   * Set a response header.
   *
   * @param name - The name of the header to set.
   * @param value - The value of the header to set.
   * @returns The middleware instance for method chaining.
   */
  private setHeader (name: string, value: string): this {
    this.headers.set(name, value)
    return this
  }

  /**
   * Add a header to the `Vary` list for the response.
   *
   * @param value - The header name to add to `Vary`.
   * @returns The middleware instance for method chaining.
   */
  private addVary (value: string): this {
    this.headerVary.push(value)
    return this
  }

  /**
   * Get the default CORS options.
   *
   * @returns An object containing the default CORS options.
   */
  private getDefaults (): Record<string, string | boolean> {
    // No default origin: an unconfigured app must stay same-origin (see `configureOrigin`).
    return {
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'
    }
  }
}

/**
 * Meta Middleware for processing CORS headers.
 */
export const MetaHandleCorsMiddleware: MetaMiddleware = { module: HandleCorsMiddleware, isClass: true, global: true }
