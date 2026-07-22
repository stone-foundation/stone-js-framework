import {
  isNotEmpty,
  Promiseable,
  isFunctionModule,
  MixedEventHandler,
  isMetaClassModule,
  isMetaFactoryModule,
  isMetaFunctionModule
} from '@stone-js/core'
import {
  IMatcher,
  BindingKey,
  IDispacher,
  HttpMethod,
  IBoundModel,
  RouteParams,
  IDispatchers,
  BindingValue,
  DispacheClass,
  DispacherType,
  IIncomingEvent,
  IBoundInstance,
  RouteDefinition,
  GenerateOptions,
  DependencyResolver,
  RouteSegmentConstraint
} from './declarations'
import { methodMatcher } from './matchers'
import { RouterError } from './errors/RouterError'
import { RouteNotFoundError } from './errors/RouteNotFoundError'
import { isFunctionPipe, MetaPipe, MixedPipe } from '@stone-js/pipeline'
import { domainRegex, isMetaComponentModule, pathRegex, uriConstraints, uriRegex } from './utils'

/**
 * Defines the options for creating a `Route` instance.
 */
export interface RouteOptions<
  IncomingEventType extends IIncomingEvent = IIncomingEvent,
  OutgoingResponseType = unknown
> extends RouteDefinition<IncomingEventType, OutgoingResponseType> {
  path: string
  domain?: string
  methods?: never
  children?: never
  protocol?: string
  method: HttpMethod
}

/**
 * Represents a route that defines how incoming events are handled.
 *
 * @template IncomingEventType - The type of the incoming event.
 * @template OutgoingResponseType - The type of the outgoing response.
 */
export class Route<IncomingEventType extends IIncomingEvent = IIncomingEvent, OutgoingResponseType = unknown> {
  private eventUrl?: URL
  private routeParams?: RouteParams
  private resolver?: DependencyResolver
  private eventQuery?: Record<string, string>
  private matchers: Array<IMatcher<IncomingEventType, OutgoingResponseType>>
  private dispatchers?: IDispatchers<IncomingEventType, OutgoingResponseType>

  private readonly uriConstraints: Array<Partial<RouteSegmentConstraint>>

  /**
   * Regexes are compiled once, at Route construction (Setup dimension), and reused
   * on every request. They are never recompiled per match, which removes the main
   * per-request cost and aligns the router with its serverless promise.
   */
  private readonly uriRegex: RegExp
  private readonly pathRegex: RegExp
  private readonly domainRegex?: RegExp

  /**
   * Factory method for creating a route instance.
   *
   * @param options - Configuration options for the route.
   * @returns A new `Route` instance.
   */
  static create<
    IncomingEventType extends IIncomingEvent = IIncomingEvent,
    OutgoingResponseType = unknown
  >(options: RouteOptions<IncomingEventType, OutgoingResponseType>): Route<IncomingEventType, OutgoingResponseType> {
    return new this(options)
  }

  /**
   * Creates a new `Route` instance.
   *
   * @param options - Configuration options for the route.
   * @returns A new `Route` instance.
   */
  constructor (public readonly options: RouteOptions<IncomingEventType, OutgoingResponseType>) {
    this.validateOptions(options)

    this.matchers = []
    this.uriConstraints = uriConstraints(options)

    // Compile once at setup. A malformed user rule surfaces here (fail-fast) rather
    // than on the first request.
    this.uriRegex = uriRegex(options)
    this.pathRegex = pathRegex(options)
    this.domainRegex = domainRegex(options)
  }

  /**
   * Gets the parameters extracted from the route.
   *
   * @throws {RouterError} If the event is not bound.
   * @returns The route parameters.
   */
  get params (): RouteParams {
    if (this.routeParams !== undefined) {
      return this.routeParams
    } else {
      throw new RouterError('Event is not bound')
    }
  }

  /**
   * Gets the URL of the event.
   *
   * @returns The event URL or a default URL (`http://localhost`).
   */
  get url (): URL {
    return this.eventUrl ?? new URL('http://localhost')
  }

  /**
   * Gets the full URI of the route.
   *
   * @returns The full URI as a string.
   */
  get uri (): string {
    return this.url.href
  }

  /**
   * Gets the pathname of the route.
   *
   * @returns The pathname as a string.
   */
  get path (): string {
    return this.url.pathname
  }

  /**
   * Gets the query parameters from the event URL.
   *
   * @returns A record of query parameters.
   */
  get query (): Record<string, string> {
    return this.eventQuery ?? {}
  }

  /**
   * Gets the hash fragment from the event URL.
   *
   * @returns The hash fragment as a string.
   */
  get hash (): string {
    return this.url.hash
  }

  /**
   * Gets the protocol for the route.
   *
   * @returns The protocol as a string (`http` or `https`).
   */
  get protocol (): string {
    return this.url.protocol.replace(':', '').trim()
  }

  /**
   * Gets the HTTP method for the route.
   *
   * @returns The HTTP method.
   */
  get method (): HttpMethod {
    return this.options.method
  }

  /**
   * Gets the hostname of the route.
   *
   * @returns The hostname as a string.
   */
  get domain (): string {
    return this.url.hostname
  }

  /**
   * Checks if the route has a domain constraint.
   *
   * @returns `true` if the route has a domain constraint, otherwise `false`.
   */
  hasDomain (): boolean {
    return this.options.domain !== undefined
  }

  /**
   * Checks if the route has any parameters.
   *
   * @returns `true` if parameters are present, otherwise `false`.
   */
  hasParams (): boolean {
    return Object.keys(this.params).length > 0
  }

  /**
   * Checks if the route has a specific parameter.
   *
   * @param name - The name of the parameter to check.
   * @returns `true` if the parameter exists, otherwise `false`.
   */
  hasParam (name: string): boolean {
    return this.params[name] !== undefined
  }

  /**
   * Retrieves the value of a specific parameter.
   *
   * @param name - The name of the parameter to retrieve.
   * @returns The value of the parameter or the fallback value if not found.
   */
  getParam<TReturn = unknown>(name: string): TReturn | undefined

  /**
   * Retrieves the value of a specific parameter.
   *
   * @param name - The name of the parameter to retrieve.
   * @param fallback - A fallback value if the parameter is not found.
   * @returns The value of the parameter or the fallback value if not found.
   */
  getParam<TReturn = unknown>(name: string, fallback: TReturn): TReturn

  /**
   * Retrieves the value of a specific parameter.
   *
   * @param name - The name of the parameter to retrieve.
   * @param fallback - An optional fallback value if the parameter is not found.
   * @returns The value of the parameter or the fallback value if not found.
   */
  getParam<TReturn = unknown>(name: string, fallback?: TReturn): TReturn | undefined {
    return this.params[name] as TReturn ?? fallback
  }

  /**
   * Retrieves all parameters that are defined (non-undefined values).
   *
   * @returns A record of defined parameters.
   */
  getDefinedParams (): RouteParams {
    return Object.fromEntries(Object.entries(this.params).filter(([_, value]) => value !== undefined))
  }

  /**
   * Retrieves the names of all parameters.
   *
   * @returns An array of parameter names.
   */
  getParamNames (): string[] {
    return Object.keys(this.params)
  }

  /**
   * Retrieves the names of all optional parameters.
   *
   * @returns An array of optional parameter names.
   */
  getOptionalParamNames (): string[] {
    return this
      .getParamNames()
      .filter(param => this.uriConstraints.find(v => v.param === param)?.optional === true)
  }

  /**
   * Checks if a parameter name is optional.
   *
   * @param name - The name of the parameter to check.
   * @returns `true` if the parameter is optional, otherwise `false`.
   */
  isParamNameOptional (name: string): boolean {
    return this.getOptionalParamNames().includes(name)
  }

  /**
   * Retrieves a specified option from the route configuration.
   *
   * @param key - The key of the option to retrieve.
   * @returns The value of the option or the fallback value if not found.
   */
  getOption<TReturn = unknown>(key: keyof RouteOptions): TReturn | undefined

  /**
   * Retrieves a specified option from the route configuration.
   *
   * @param key - The key of the option to retrieve.
   * @param fallback - A fallback value if the option is not found.
   * @returns The value of the option or the fallback value if not found.
   */
  getOption<TReturn = unknown>(key: keyof RouteOptions, fallback: TReturn): TReturn

  /**
   * Retrieves a specified option from the route configuration.
   *
   * @param key - The key of the option to retrieve.
   * @param fallback - An optional fallback value if the option is not found.
   * @returns The value of the option or the fallback value if not found.
   */
  getOption<TReturn = unknown>(key: keyof RouteOptions, fallback?: TReturn): TReturn | undefined {
    return this.options[key] as TReturn ?? fallback
  }

  /**
   * Retrieves a specified options from the route configuration.
   *
   * @param keys - The kesy of the option to retrieve.
   * @returns The values of the option.
   */
  getOptions<TReturn = unknown>(keys: string[]): Record<string, TReturn> {
    return Object.fromEntries(keys.map(key => [key, this.options[key] as TReturn]))
  }

  /**
   * Adds a middleware to the route.
   *
   * @param middleware - The middleware to add.
   * @returns The updated `Route` instance.
   */
  addMiddleware (
    middleware: MixedPipe<IncomingEventType, OutgoingResponseType> | Array<MixedPipe<IncomingEventType, OutgoingResponseType>>
  ): this {
    this.options.middleware = (this.options.middleware ?? []).concat(middleware)
    return this
  }

  /**
   * Checks if the route requires HTTPS for security.
   *
   * @returns `true` if the route is HTTPS-only, otherwise `false`.
   */
  isSecure (): boolean {
    return this.isHttpsOnly()
  }

  /**
   * Checks if the route uses HTTP protocol.
   *
   * @returns `true` if the route is HTTP-only, otherwise `false`.
   */
  isHttpOnly (): boolean {
    return this.options.protocolPolicy === 'force-http'
  }

  /**
   * Checks if the route uses HTTPS protocol.
   *
   * @returns `true` if the route is HTTPS-only, otherwise `false`.
   */
  isHttpsOnly (): boolean {
    return this.options.protocolPolicy === 'force-https'
  }

  /**
   * Checks if the route is marked as a fallback route.
   *
   * @returns `true` if the route is a fallback, otherwise `false`.
   */
  isFallback (): boolean {
    return this.options.fallback ?? false
  }

  /**
   * Checks if the route operates in strict mode.
   *
   * @returns `true` if the route is strict, otherwise `false`.
   */
  isStrict (): boolean {
    return this.options.strict === true
  }

  /**
   * Determines if a specific middleware is excluded from execution.
   *
   * @param mixedMiddleware - The middleware to check.
   * @returns `true` if the middleware is excluded, otherwise `false`.
   */
  isMiddlewareExcluded (mixedMiddleware: MixedPipe<IncomingEventType, OutgoingResponseType>): boolean {
    const metaMid = mixedMiddleware as MetaPipe<IncomingEventType, OutgoingResponseType>
    const middleware = isFunctionPipe(metaMid) ? mixedMiddleware : metaMid.module
    return this.getOption<Array<MixedPipe<IncomingEventType, OutgoingResponseType>>>(
      'excludeMiddleware'
    )?.includes(middleware) === true
  }

  /**
   * Returns the compiled regex matching the full URI (domain + path).
   *
   * Used to extract parameter values via named capture groups.
   *
   * @returns The precompiled URI regex.
   */
  getUriRegex (): RegExp {
    return this.uriRegex
  }

  /**
   * Returns the compiled regex matching the path only.
   *
   * @returns The precompiled path regex.
   */
  getPathRegex (): RegExp {
    return this.pathRegex
  }

  /**
   * Returns the compiled regex matching the domain, or `undefined` when the route
   * has no domain constraint.
   *
   * @returns The precompiled domain regex or `undefined`.
   */
  getDomainRegex (): RegExp | undefined {
    return this.domainRegex
  }

  /**
   * Computes a deterministic specificity score for the route.
   *
   * Higher is more specific. Static segments outrank required parameters, which
   * outrank optional parameters, which outrank catch-all (`*`/`+`) wildcards. This
   * lets the collection order routes by specificity independently of their
   * declaration order (e.g. `/users/new` wins over `/users/:id`).
   *
   * @returns The specificity score.
   */
  getScore (): number {
    return this.uriConstraints.reduce((score, constraint) => {
      if (constraint.param === undefined) { return score + 4 } // static segment or domain
      if (constraint.quantifier === '*' || constraint.quantifier === '+') { return score + 1 } // catch-all
      if (constraint.optional === true) { return score + 2 } // optional param
      return score + 3 // required param
    }, 0)
  }

  /**
   * Checks if the provided event matches the route.
   *
   * @param event - The incoming event to check against the route.
   * @param includingMethod - Whether to include HTTP method matching in the evaluation.
   * @returns `true` if the event matches the route, otherwise `false`.
   */
  matches (event: IncomingEventType, includingMethod: boolean): boolean {
    return this.matchers
      .filter(matcher => !(!includingMethod && matcher === methodMatcher)) // Skip method matcher if not needed
      .reduce((matched, matcher) => matched && matcher({ route: this, event }), true)
  }

  /**
   * Binds the provided event to the route, initializing route parameters and query data.
   *
   * @param event - The incoming event to bind to the route.
   * @returns A promise that resolves once the binding is complete.
   */
  async bind (event: IncomingEventType): Promise<void> {
    this.eventUrl = event.url
    this.routeParams = await this.bindParameters(event)
    this.eventQuery = Object.fromEntries(event.query?.entries() ?? [])
  }

  /**
   * Executes the route's action based on the provided event.
   *
   * Note: The order of execution is important and should not be changed.
   *
   * @param event - The incoming event to handle.
   * @returns A promise that resolves to the outgoing response generated by the route's action.
   * @throws `RouterError` if the route action is invalid.
   */
  async run (event: IncomingEventType): Promise<OutgoingResponseType> {
    return await this.getDispatcher().dispatch({ event, route: this })
  }

  /**
   * Generates a URL or URI for the route with optional parameters, query, hash, and protocol.
   *
   * @param options - Options for generating the URL.
   *   - `params`: Route parameters to include in the path.
   *   - `query`: Query parameters to append to the URL.
   *   - `hash`: A hash fragment to include in the URL.
   *   - `withDomain`: Whether to include the domain in the URL.
   *   - `protocol`: The protocol to use in the URL.
   * @returns The generated URL as a string.
   * @throws `RouterError` if required parameters are missing.
   */
  generate ({ params = {}, query = {}, hash = '', withDomain = false, protocol }: Omit<GenerateOptions, 'name'>): string {
    // Helper to construct hash value
    const formatHash = (hash: string): string => {
      if (hash.length === 0) { return '' }
      return hash.startsWith('#') ? hash : `#${hash}`
    }

    // Build query parameters (params that are not route constraints + explicit query).
    // Values are stringified so falsy values (0, false, '') survive.
    const queryParams = new URLSearchParams([
      ...Object.entries(params)
        .filter(([name]) => !this.uriConstraints.some(constraint => constraint.param === name))
        .map(([name, value]): [string, string] => [name, String(value)]),
      ...Object.entries(query).map(([name, value]): [string, string] => [name, String(value)])
    ]).toString()

    let domainPart = ''
    let path = '/'

    for (const constraint of this.uriConstraints) {
      const hasParam = constraint.param !== undefined
      const paramValue = hasParam ? (params[constraint.param as string] ?? constraint.default) : undefined

      // Validate required parameters (`0`, `false`, `''` are valid values, only `null`/`undefined` are missing).
      if (hasParam && constraint.optional !== true && (paramValue === undefined || paramValue === null)) {
        throw new RouterError(`Missing required parameter "${String(constraint.param)}"`)
      }

      // Domain constraints carry a `suffix`; they are prepended only when a full URL is requested.
      if (constraint.suffix !== undefined) {
        if (withDomain) {
          const sub = hasParam && paramValue !== undefined && paramValue !== null ? this.encodeParam(paramValue, constraint) : ''
          domainPart = `${protocol ?? this.protocol}://${sub}${String(constraint.suffix)}`
        }
        continue
      }

      // Path segments.
      if (hasParam) {
        if (paramValue === undefined || paramValue === null) { continue } // optional & absent
        path += `${constraint.prefix ?? ''}${this.encodeParam(paramValue, constraint)}/`
      } else if (constraint.match !== undefined) {
        path += `${String(constraint.match)}/`
      }
    }

    // Collapse redundant slashes in the path only (never touches the domain's `://`).
    path = path.replace(/\/{2,}/g, '/')

    // Combine domain, path, query, and hash.
    return [`${domainPart}${path}`, queryParams.length > 0 ? `?${queryParams}` : '', formatHash(hash)]
      .filter(part => part.length > 0)
      .join('')
  }

  /**
   * URL-encodes a parameter value for safe insertion into a generated URL.
   *
   * Catch-all parameters (`*`/`+`) legitimately contain `/`, so each of their
   * sub-segments is encoded independently and rejoined; every other value is fully
   * encoded. This prevents path traversal (`../`) and query/fragment injection
   * (`?`, `#`) through generated links and `navigate()`.
   *
   * @param value - The raw parameter value.
   * @param constraint - The constraint the value belongs to.
   * @returns The encoded value.
   */
  private encodeParam (value: unknown, constraint: Partial<RouteSegmentConstraint>): string {
    const raw = String(value)
    return constraint.quantifier === '*' || constraint.quantifier === '+'
      ? raw.split('/').map(encodeURIComponent).join('/')
      : encodeURIComponent(raw)
  }

  /**
   * Sets the resolver for the route.
   * The resolver is used to resolve the route's handler.
   *
   * @param resolver - The resolver to set.
   * @returns The updated `Route` instance.
   */
  setResolver (resolver?: DependencyResolver): this {
    this.resolver = resolver
    return this
  }

  /**
   * Sets the matchers to use for evaluating if an event matches the route.
   *
   * @param matchers - An array of matchers to set.
   * @returns The updated `Route` instance.
   */
  setMatchers (matchers: Array<IMatcher<IncomingEventType, OutgoingResponseType>>): this {
    this.matchers = matchers
    return this
  }

  /**
   * Sets the dispatchers for handling callable or handler actions.
   *
   * @param dispatchers - The dispatchers to set.
   * @returns The updated `Route` instance.
   */
  setDispatchers (dispatchers: IDispatchers<IncomingEventType, OutgoingResponseType>): this {
    this.dispatchers = dispatchers
    return this
  }

  /**
   * Converts the route into a JSON object representation.
   *
   * @returns A JSON object representing the route.
   */
  async toJSON (): Promise<Record<string, unknown>> {
    return {
      path: this.options.path,
      method: this.options.method,
      handler: await this.getHandlerName(),
      name: this.options.name ?? 'N/A',
      domain: this.options.domain ?? 'N/A',
      fallback: this.isFallback()
    }
  }

  /**
   * Converts the route into a string representation (JSON format).
   *
   * @returns A JSON string representing the route.
   */
  async toString (): Promise<string> {
    return JSON.stringify(await this.toJSON())
  }

  private async bindParameters (event: IncomingEventType): Promise<RouteParams> {
    if (event.getUri === undefined) {
      throw new RouterError('Event must have a `getUri` method.')
    }

    const params: RouteParams = {}

    // Bind by named capture group (`p0`, `p1`, ...) rather than by flat positional
    // index: this is immune to extra capture groups a user rule might introduce, and
    // keeps values as raw strings (no destructive numeric coercion of ids like
    // '00123' or values above Number.MAX_SAFE_INTEGER).
    const groups = event.getUri(this.hasDomain())?.match(this.uriRegex)?.groups ?? {}

    for (const [i, constraint] of this.uriConstraints.filter(({ param }) => param !== undefined).entries()) {
      let value: unknown = groups[`p${i}`]

      if (constraint.alias !== undefined) {
        params[constraint.alias] = value ?? constraint.default
      }

      if (constraint.param !== undefined) {
        value = this.hasModelBinding(constraint.param) ? await this.bindValue(constraint.param, value, constraint.alias) : value
        params[constraint.param] = value ?? constraint.default

        if (params[constraint.param] === undefined && constraint.optional !== true) {
          throw new RouteNotFoundError(`No value found for this key "${String(constraint.param)}".`)
        }
      }
    }

    return Object
      .entries(this.options.defaults ?? {})
      .reduce((prev, [name, value]) => prev[name] !== undefined ? prev : { ...prev, [name]: value }, params)
  }

  private hasModelBinding (key: string): boolean {
    return this.options.bindings?.[key] !== undefined
  }

  private bindValue (field: string, value: unknown, alias?: string): Promiseable<unknown> {
    const key = alias ?? field
    const bindingOptions = this.options.bindings?.[field]
    const bindingResolver = (bindingOptions as IBoundModel)?.resolveRouteBinding ?? bindingOptions

    if (typeof bindingResolver === 'function') {
      return bindingResolver(key, value, this.resolver)
    } else if (typeof bindingOptions === 'string') {
      const [alias, method = 'resolveRouteBinding'] = bindingOptions.split('@')
      return this.resolver?.resolve<IBoundInstance>(alias)?.[method](key, value)
    } else {
      throw new RouterError('Binding must be either a class with a static bindingResolver method or a function.')
    }
  }

  private async getHandlerName (): Promise<string> {
    if (isNotEmpty<MixedEventHandler<IncomingEventType, OutgoingResponseType>>(this.options.handler)) {
      return await this.getDispatcher().getName(this)
    }
    return 'N/A'
  }

  private getDispatcher (): IDispacher<IncomingEventType, OutgoingResponseType> {
    const type = this.getDispatcherType()
    const dispatcher = isNotEmpty<DispacherType>(type) ? this.dispatchers?.[type] : undefined

    if (isNotEmpty<DispacheClass<IncomingEventType, OutgoingResponseType>>(dispatcher)) {
      return this.resolveModule<IDispacher<IncomingEventType, OutgoingResponseType>>(dispatcher)
    }

    throw new RouterError(`Dispatcher for ${String(type)} not found`)
  }

  private getDispatcherType (): DispacherType | undefined {
    if (isNotEmpty(this.options.redirect)) {
      return 'redirect'
    } else if (isMetaComponentModule(this.options.handler)) {
      return 'component'
    } else if (isMetaClassModule(this.options.handler)) {
      return 'class'
    } else if (
      isMetaFactoryModule(this.options.handler) ||
      isMetaFunctionModule(this.options.handler) ||
      isFunctionModule(this.options.handler)
    ) {
      return 'callable'
    }
  }

  private resolveModule <T extends BindingValue>(Class: BindingKey): T {
    return this.resolver?.resolve<T>(Class) ?? new (Class as new () => T)()
  }

  private validateOptions (options: RouteOptions<IncomingEventType, OutgoingResponseType>): void {
    if (options === undefined) {
      throw new RouterError('Route options are required to create a Route instance')
    }
  }
}
