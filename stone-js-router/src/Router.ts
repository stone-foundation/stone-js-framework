import {
  HttpMethod,
  RouteParams,
  RouterOptions,
  IIncomingEvent,
  RouteDefinition,
  GenerateOptions,
  NavigateOptions,
  FunctionalEventHandler,
  FunctionalRouteDefinition,
  FunctionalPageRouteDefinition,
  FunctionalRouteGroupDefinition
} from './declarations'
import { Route } from './Route'
import { RouteMapper } from './RouteMapper'
import { RouteEvent } from './events/RouteEvent'
import { RouterError } from './errors/RouterError'
import { RouteCollection } from './RouteCollection'
import { browserNavigator } from './navigators'
import { RouteNotFoundError } from './errors/RouteNotFoundError'
import { FunctionalEventListener, isObjectLikeModule } from '@stone-js/core'
import { DELETE, GET, MAX_URI_LENGTH, OPTIONS, PATCH, POST, PUT } from './constants'
import { isAliasPipe, isClassPipe, isFactoryPipe, MetaPipe, MixedPipe, PipeInstance, Pipeline, PipelineOptions } from '@stone-js/pipeline'

/**
 * Represents a configurable router for managing HTTP routes and handling incoming events.
 *
 * @template IncomingEventType - Type of incoming events.
 * @template OutgoingResponseType - Type of outgoing responses.
 */
export class Router<
  IncomingEventType extends IIncomingEvent = IIncomingEvent,
  OutgoingResponseType = unknown
> {
  private readonly routeMapper: RouteMapper<IncomingEventType, OutgoingResponseType>

  private groupDefinition?: FunctionalRouteGroupDefinition
  private currentRoute?: Route<IncomingEventType, OutgoingResponseType>
  private routes: RouteCollection<IncomingEventType, OutgoingResponseType>
  /** Peeked routes, one per event, so asking twice matches once. Weak, so an event owns its entry. */
  private readonly peekedRoutes = new WeakMap<object, Route<IncomingEventType, OutgoingResponseType>>()

  /**
   * Factory method for creating a router instance.
   *
   * @param options - Configuration options for the router.
   * @returns A new `Router` instance.
   */
  static create<
    IncomingEventType extends IIncomingEvent = IIncomingEvent,
    OutgoingResponseType = unknown
  >(
    options: RouterOptions<IncomingEventType, OutgoingResponseType>
  ): Router<IncomingEventType, OutgoingResponseType> {
    return new this(options)
  }

  /**
   * Constructs a `Router` instance.
   *
   * @param routerOptions - Configuration options for the router.
   */
  protected constructor (
    private routerOptions: RouterOptions<IncomingEventType, OutgoingResponseType>
  ) {
    this.routeMapper = RouteMapper.create<IncomingEventType, OutgoingResponseType>(routerOptions)
    this.routes = RouteCollection.create<IncomingEventType, OutgoingResponseType>(
      this.routeMapper.toRoutes(routerOptions.definitions)
    )
  }

  /**
   * Creates a route group.
   *
   * @param path - The base path for the group.
   * @param definition - Optional group-specific route definitions.
   * @returns The router instance for chaining.
   */
  group (
    path: string,
    definition?: Omit<
    FunctionalRouteGroupDefinition<IncomingEventType, OutgoingResponseType>,
    'path'
    >
  ): this {
    this.groupDefinition = { ...definition, path }
    return this
  }

  /**
   * Removes the current group definition, ending the grouping context.
   *
   * @returns The router instance for chaining.
   */
  noGroup (): this {
    this.groupDefinition = undefined
    return this
  }

  /**
   * Registers a route that supports the `OPTIONS` method.
   *
   * @param path - The route path.
   * @param handlerOrDefinition - The route handler or functional definition.
   * @returns The router instance for chaining.
   */
  options (
    path: string | string[],
    handlerOrDefinition:
    | FunctionalEventHandler<IncomingEventType, OutgoingResponseType>
    | FunctionalRouteDefinition<IncomingEventType, OutgoingResponseType>
  ): this {
    return this.match(path, handlerOrDefinition, [OPTIONS])
  }

  /**
   * Registers a route that supports the `GET` and `HEAD` methods.
   *
   * @param path - The route path.
   * @param handlerOrDefinition - The route handler or functional definition.
   * @returns The router instance for chaining.
   */
  get (
    path: string | string[],
    handlerOrDefinition:
    | FunctionalEventHandler<IncomingEventType, OutgoingResponseType>
    | FunctionalRouteDefinition<IncomingEventType, OutgoingResponseType>
  ): this {
    return this.match(path, handlerOrDefinition, [GET])
  }

  /**
   * Registers a route that supports the `GET` and `HEAD` methods.
   *
   * @param path - The route path.
   * @param handlerOrDefinition - The route handler or functional definition.
   * @returns The router instance for chaining.
   */
  add (
    path: string | string[],
    handlerOrDefinition:
    | FunctionalEventHandler<IncomingEventType, OutgoingResponseType>
    | FunctionalRouteDefinition<IncomingEventType, OutgoingResponseType>
  ): this {
    return this.get(path, handlerOrDefinition)
  }

  /**
   * Registers a route that supports the `GET` and `HEAD` methods.
   * Route is considered as a page route.
   *
   * @param path - The route path.
   * @param definition - The route functional definition.
   * @returns The router instance for chaining.
   */
  page (
    path: string | string[],
    definition: FunctionalPageRouteDefinition<IncomingEventType, OutgoingResponseType>
  ): this {
    return this.get(path, definition)
  }

  /**
   * Registers a route that supports the `POST` method.
   *
   * @param path - The route path.
   * @param handlerOrDefinition - The route handler or functional definition.
   * @returns The router instance for chaining.
   */
  post (
    path: string | string[],
    handlerOrDefinition:
    | FunctionalEventHandler<IncomingEventType, OutgoingResponseType>
    | FunctionalRouteDefinition<IncomingEventType, OutgoingResponseType>
  ): this {
    return this.match(path, handlerOrDefinition, [POST])
  }

  /**
   * Registers a route that supports the `PUT` method.
   *
   * @param path - The route path.
   * @param handlerOrDefinition - The route handler or functional definition.
   * @returns The router instance for chaining.
   */
  put (
    path: string | string[],
    handlerOrDefinition:
    | FunctionalEventHandler<IncomingEventType, OutgoingResponseType>
    | FunctionalRouteDefinition<IncomingEventType, OutgoingResponseType>
  ): this {
    return this.match(path, handlerOrDefinition, [PUT])
  }

  /**
   * Registers a route that supports the `PATCH` method.
   *
   * @param path - The route path.
   * @param handlerOrDefinition - The route handler or functional definition.
   * @returns The router instance for chaining.
   */
  patch (
    path: string | string[],
    handlerOrDefinition:
    | FunctionalEventHandler<IncomingEventType, OutgoingResponseType>
    | FunctionalRouteDefinition<IncomingEventType, OutgoingResponseType>
  ): this {
    return this.match(path, handlerOrDefinition, [PATCH])
  }

  /**
   * Registers a route that supports the `DELETE` method.
   *
   * @param path - The route path.
   * @param handlerOrDefinition - The route handler or functional definition.
   * @returns The router instance for chaining.
   */
  delete (
    path: string | string[],
    handlerOrDefinition:
    | FunctionalEventHandler<IncomingEventType, OutgoingResponseType>
    | FunctionalRouteDefinition<IncomingEventType, OutgoingResponseType>
  ): this {
    return this.match(path, handlerOrDefinition, [DELETE])
  }

  /**
   * Registers a route that supports all HTTP methods.
   *
   * @param path - The route path.
   * @param handlerOrDefinition - The route handler or functional definition.
   * @returns The router instance for chaining.
   */
  any (
    path: string | string[],
    handlerOrDefinition:
    | FunctionalEventHandler<IncomingEventType, OutgoingResponseType>
    | FunctionalRouteDefinition<IncomingEventType, OutgoingResponseType>
  ): this {
    return this.match(path, handlerOrDefinition, [GET, POST, PUT, PATCH, DELETE, OPTIONS])
  }

  /**
   * Registers a fallback route to handle unmatched requests.
   *
   * @param action - The handler to execute for the fallback route.
   * @returns The current `Router` instance.
   */
  fallback (
    action: FunctionalEventHandler<IncomingEventType, OutgoingResponseType>
  ): this {
    return this.get('/:__fallback__(.*)*', { action, fallback: true })
  }

  /**
   * Adds a route to the router for specific HTTP methods.
   *
   * @param path - The path for the route.
   * @param handlerOrDefinition - The handler to execute or a route definition object.
   * @param methods - An array of HTTP methods this route should handle.
   * @returns The current `Router` instance.
   */
  match (
    path: string | string[],
    handlerOrDefinition:
    | FunctionalEventHandler<IncomingEventType, OutgoingResponseType>
    | FunctionalRouteDefinition<IncomingEventType, OutgoingResponseType>,
    methods: HttpMethod[]
  ): this {
    const child: RouteDefinition<IncomingEventType, OutgoingResponseType> = typeof handlerOrDefinition === 'object'
      ? { ...handlerOrDefinition, path, methods }
      : { path, handler: handlerOrDefinition, methods }
    const definition = this.groupDefinition === undefined ? child : { ...this.groupDefinition, children: [child] }

    this.routerOptions.definitions = this.routerOptions.definitions.concat(definition)
    this.routeMapper.toRoutes([definition]).forEach((route) => this.routes.add(route))

    return this
  }

  /**
   * Defines multiple route definitions in the router.
   *
   * @param definitions - An array of route definitions to add.
   * @returns The current `Router` instance.
   */
  define (definitions: Array<RouteDefinition<IncomingEventType, OutgoingResponseType>>): this {
    this.routerOptions.definitions = definitions
    this.routeMapper.toRoutes(definitions).forEach((route) => this.routes.add(route))
    return this
  }

  /**
   * Sets the routes for the router using a `RouteCollection`.
   *
   * @param routes - The `RouteCollection` instance containing routes to set.
   * @returns The current `Router` instance.
   * @throws {RouterError} If the provided parameter is not an instance of `RouteCollection`.
   */
  setRoutes (routes: RouteCollection<IncomingEventType, OutgoingResponseType>): this {
    if (!(routes instanceof RouteCollection)) {
      throw new RouterError('Parameter must be an instance of RouteCollection')
    }

    this.routes = routes

    return this
  }

  /**
   * Configures the router with specific options.
   *
   * @param options - A partial configuration object for the router.
   * @returns The current `Router` instance.
   */
  configure (options: Partial<RouterOptions<IncomingEventType, OutgoingResponseType>>): this {
    this.routerOptions = { ...this.routerOptions, ...options }
    this.routes = RouteCollection.create<IncomingEventType, OutgoingResponseType>(
      this.routeMapper.toRoutes(this.routerOptions.definitions)
    )
    return this
  }

  /**
   * Adds global middleware to the router.
   *
   * @param middleware - A single middleware or an array of middleware to add.
   * @returns The current `Router` instance.
   */
  use (
    middleware:
    | MixedPipe<IncomingEventType, OutgoingResponseType>
    | Array<MixedPipe<IncomingEventType, OutgoingResponseType>>
  ): this {
    this.routerOptions.middleware ??= []
    this.routerOptions.middleware = this.routerOptions.middleware.concat(middleware)
    return this
  }

  /**
   * Attaches middleware to specific routes by their name.
   *
   * @param name - A single route name or an array of route names to attach the middleware to.
   * @param middleware - A single middleware or an array of middleware to attach.
   * @returns The current `Router` instance.
   */
  useOn (
    name: string | string[],
    middleware:
    | MixedPipe<IncomingEventType, OutgoingResponseType>
    | Array<MixedPipe<IncomingEventType, OutgoingResponseType>>
  ): this {
    new Array(name).flat().forEach((name) => {
      this
        .routerOptions
        .definitions
        .filter((v) => v.name === name)
        .forEach((v) => {
          v.middleware = (v.middleware ?? []).concat(middleware)
          this.routes.getByName(name)?.addMiddleware(middleware)
        })
    })

    return this
  }

  /**
   * Subscribes to an event emitted by the router's event emitter.
   *
   * @param eventName - The name of the event to listen for.
   * @param listener - The listener function to execute when the event is emitted.
   * @returns The current `Router` instance.
   */
  on (eventName: string, listener: FunctionalEventListener): this {
    this.routerOptions.eventEmitter?.on(eventName, listener)
    return this
  }

  /**
   * Unsubscribes from an event emitted by the router's event emitter.
   *
   * @param eventName - The name of the event to stop listening for.
   * @param listener - The listener function to remove.
   * @returns The current `Router` instance.
   */
  off (eventName: string, listener: FunctionalEventListener): this {
    this.routerOptions.eventEmitter?.off(eventName, listener)
    return this
  }

  /**
   * Dispatches an event through the router to find and execute the corresponding route.
   *
   * @param event - The incoming event to process.
   * @returns A promise resolving to the outgoing response after executing the matched route.
   */
  async dispatch (event: IncomingEventType): Promise<OutgoingResponseType> {
    return await this.runRoute(event, await this.findRoute(event))
  }

  /**
   * Dispatches an event to a specific route by its name.
   *
   * @param event - The incoming event to process.
   * @param name - The name of the route to execute.
   * @returns A promise resolving to the outgoing response after executing the specified route.
   * @throws {RouteNotFoundError} If no route is found with the given name.
   */
  async respondWithRouteName (
    event: IncomingEventType,
    name: string
  ): Promise<OutgoingResponseType> {
    const route = this.routes.getByName(name)

    if (route === undefined) {
      throw new RouteNotFoundError(`No routes found with this name ${name}`)
    }

    return await this.runRoute(event, route)
  }

  /**
   * Finds and matches a route for the given event.
   *
   * @param event - The incoming event to find a route for.
   * @returns The matched route.
   * @throws {RouteNotFoundError} If no route matches the given event.
   */
  async findRoute (
    event: IncomingEventType
  ): Promise<Route<IncomingEventType, OutgoingResponseType>> {
    await this.routerOptions.eventEmitter?.emit(
      RouteEvent.create({ type: RouteEvent.ROUTING, source: this, metadata: { event } })
    )

    this.ensureUriWithinLimit(event)

    this.currentRoute = this.routes.match(event)

    return this.currentRoute
  }

  /**
   * The route this event resolves to, bound, from any layer.
   *
   * Before routing (a kernel or group middleware), no route exists on the event yet, and even on the
   * router layer the parameters are only bound after the route middleware have run. Reading a
   * parameter therefore took a three-line dance everywhere: find the route, bind it, read it. This is
   * that dance, done once and remembered per event.
   *
   * It is a peek, not a dispatch: nothing is emitted, `currentRoute` is untouched, and the router's
   * own resolution later proceeds exactly as if nobody had looked. The event's already-resolved route
   * is reused when there is one, so asking after routing costs one map lookup.
   *
   * @param event - The incoming event.
   * @returns The bound route.
   * @throws {RouteNotFoundError} When no route matches the event.
   */
  async getBoundRoute (event: IncomingEventType): Promise<Route<IncomingEventType, OutgoingResponseType>> {
    const peeked = this.peekedRoutes.get(event)
    if (peeked !== undefined) { return peeked }

    let route = event.getRoute?.<IncomingEventType, OutgoingResponseType>()

    if (route === undefined) {
      this.ensureUriWithinLimit(event)
      route = this.routes.match(event)
    }

    await route.bind(event)
    this.peekedRoutes.set(event, route)

    return route
  }

  /**
   * One parameter of the route this event resolves to, from any layer.
   *
   * The sugar over {@link getBoundRoute} for the common case: a group middleware reading the
   * `orgCode` its guard needs, a locale middleware reading `:lang`. Named alongside
   * {@link findRoute}, because `find*` is the family that takes an event and may match, where
   * {@link getParam} reads the already-dispatched current route.
   *
   * A parameter of a route that does not exist is simply absent, so a miss answers the fallback
   * rather than throwing: deciding that a request is a 404 is the router's job at dispatch, not the
   * caller's at peek.
   *
   * @param event - The incoming event.
   * @param name - The parameter to read.
   * @param fallback - What to answer when the route has no such parameter, or no route matches.
   * @returns The parameter's value, or the fallback.
   */
  async findParam<TReturn = unknown> (
    event: IncomingEventType,
    name: string,
    fallback?: TReturn
  ): Promise<TReturn | undefined> {
    try {
      return (await this.getBoundRoute(event)).getParam<TReturn>(name, fallback as TReturn)
    } catch (error) {
      if (error instanceof RouteNotFoundError) { return fallback }
      throw error
    }
  }

  /**
   * Rejects abnormally long request URIs before any matching happens.
   *
   * Defence-in-depth: the segment regexes are already linear, but bounding the input
   * length caps the cost of any residual backtracking in user-supplied rules.
   *
   * @param event - The incoming event.
   * @throws {RouteNotFoundError} If the URI exceeds the configured maximum length.
   */
  private ensureUriWithinLimit (event: IncomingEventType): void {
    const maxLength = this.routerOptions.maxUriLength ?? MAX_URI_LENGTH
    const uri = event.getUri?.(true) ?? event.decodedPathname ?? event.pathname

    if (typeof uri === 'string' && uri.length > maxLength) {
      throw new RouteNotFoundError(`Request URI exceeds the maximum allowed length of ${maxLength} characters.`)
    }
  }

  /**
   * Generates a URL based on a named route and the provided options.
   *
   * @param options - Options for generating the URL, including the route name, parameters, and query.
   * @returns The generated URL as a string.
   * @throws {RouteNotFoundError} If no route is found with the specified name.
   */
  generate (options: GenerateOptions): string {
    const route = this.routes.getByName(options.name)

    if (route === undefined) {
      throw new RouteNotFoundError(`No routes found with this name ${String(options.name)}`)
    }

    return route.generate(options)
  }

  /**
   * Navigates to a specific route.
   *
   * Resolving the destination is platform-independent (a route name becomes a path here);
   * performing the effect is not, so it is delegated to the configured
   * {@link RouterNavigator}. The default one drives the browser's History API, which is
   * why this throws outside a browser unless another navigator is configured under
   * `stone.router.navigator`.
   *
   * @param pathOrOptions - The path or navigation options, including route name and parameters.
   * @param replace - Whether to replace the current history entry instead of adding a new one.
   * @throws {RouterError} If no navigator is configured and this runs outside a browser.
   */
  navigate (pathOrOptions: string | NavigateOptions, replace?: boolean): void {
    let path = typeof pathOrOptions === 'string' ? pathOrOptions : ''
    const options = (isObjectLikeModule(pathOrOptions) ? pathOrOptions : {}) as NavigateOptions

    if (typeof options.name === 'string') {
      path = this.generate({ ...options, withDomain: false })
    }

    const navigator = this.routerOptions.navigator ?? browserNavigator

    navigator({ path, replace: replace === true, options })
  }

  /**
   * Collects middleware for a specific route, including global and route-specific middleware.
   *
   * @param route - The route for which middleware should be gathered.
   * @returns An array of middleware to execute for the route.
   */
  gatherRouteMiddleware (
    route: Route<IncomingEventType, OutgoingResponseType>
  ): Array<MixedPipe<IncomingEventType, OutgoingResponseType>> {
    return this
      .routerOptions
      .middleware
      ?.concat(route.getOption('middleware', []))
      .filter((v) => this.routerOptions.skipMiddleware !== true && v !== undefined && !route.isMiddlewareExcluded(v))
      .reduce<Array<MixedPipe<IncomingEventType, OutgoingResponseType>>>(
      (acc, middleware) => (acc.includes(middleware) ? acc : acc.concat(middleware)), []
    ) ?? []
  }

  /**
   * Retrieves the parameters of the current route.
   *
   * @returns An object containing the parameters of the current route, or `undefined` if no route is active.
   */
  getParams (): RouteParams | undefined {
    return this.currentRoute?.params
  }

  /**
   * Retrieves a specific parameter from the current route.
   *
   * @template TReturn - The expected return type of the parameter.
   * @param name - The name of the parameter to retrieve.
   * @param fallback - An optional fallback value to return if the parameter is not found.
   * @returns The value of the parameter, or the fallback value if the parameter is not found.
   */
  getParam<TReturn = unknown>(name: string, fallback?: TReturn): TReturn | undefined {
    return this.currentRoute?.getParam(name, fallback)
  }

  /**
   * Checks if the router contains a route with the given name(s).
   *
   * @param name - A route name or an array of route names to check.
   * @returns `true` if at least one of the specified routes exists, `false` otherwise.
   */
  hasRoute (name: string | string[]): boolean {
    return [name]
      .flat()
      .some((v) => this.routes.hasNamedRoute(v))
  }

  /**
   * Retrieves the currently active route.
   *
   * @returns The current route, or `undefined` if no route is active.
   */
  getCurrentRoute (): Route<IncomingEventType, OutgoingResponseType> | undefined {
    return this.currentRoute
  }

  /**
   * Retrieves the name of the currently active route.
   *
   * @returns The name of the current route, or `undefined` if no route is active.
   */
  getCurrentRouteName (): string | undefined {
    return this.currentRoute?.getOption('name')
  }

  /**
   * Checks if the currently active route matches the specified name.
   *
   * @param name - The name to compare with the current route's name.
   * @returns `true` if the current route's name matches the specified name, `false` otherwise.
   */
  isCurrentRouteNamed (name: string): boolean {
    return this.getCurrentRouteName() === name
  }

  /**
   * Retrieves the collection of all routes in the router.
   *
   * @returns A `RouteCollection` containing all registered routes.
   */
  getRoutes (): RouteCollection<IncomingEventType, OutgoingResponseType> {
    return this.routes
  }

  /**
   * Dumps all routes as an array of JSON objects.
   *
   * @returns An array of JSON objects representing the routes.
   */
  async dumpRoutes (): Promise<Array<Record<string, unknown>>> {
    return await this.routes.dump()
  }

  private async runRoute (
    event: IncomingEventType,
    route: Route<IncomingEventType, OutgoingResponseType>
  ): Promise<OutgoingResponseType> {
    event.setRouteResolver?.(() => route)
    await this.routerOptions.eventEmitter?.emit(
      RouteEvent.create({
        source: this,
        metadata: { event, route },
        type: RouteEvent.ROUTED
      })
    )
    return await this.runRouteWithMiddleware(event, route)
  }

  private async runRouteWithMiddleware (
    event: IncomingEventType,
    route: Route<IncomingEventType, OutgoingResponseType>
  ): Promise<OutgoingResponseType> {
    return await Pipeline
      .create<IncomingEventType, OutgoingResponseType>(this.makePipelineOptions())
      .send(event)
      .through(...this.gatherRouteMiddleware(route))
      .then(async (ev) => await this.bindAndRun(route, ev))
  }

  private async bindAndRun (
    route: Route<IncomingEventType, OutgoingResponseType>,
    event: IncomingEventType
  ): Promise<OutgoingResponseType> {
    await route
      .setDispatchers(this.routerOptions.dispatchers)
      .setResolver(this.routerOptions.dependencyResolver)
      .bind(event)

    return await route.run(event)
  }

  private makePipelineOptions (): PipelineOptions<IncomingEventType, OutgoingResponseType> {
    return {
      resolver: (metaPipe: MetaPipe<IncomingEventType, OutgoingResponseType>) => {
        if (isClassPipe(metaPipe) || isAliasPipe(metaPipe)) {
          return this
            .routerOptions
            .dependencyResolver
            ?.resolve<PipeInstance<IncomingEventType, OutgoingResponseType>>(
            metaPipe.module, true
          )
        } else if (isFactoryPipe(metaPipe)) {
          return metaPipe.module(this.routerOptions.dependencyResolver)
        }
      }
    }
  }
}
