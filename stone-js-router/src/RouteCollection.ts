import { Route } from './Route'
import { HTTP_METHODS } from './constants'
import { IIncomingEvent } from './declarations'
import { RouterError } from './errors/RouterError'
import { RouteNotFoundError } from './errors/RouteNotFoundError'
import { MethodNotAllowedError } from './errors/MethodNotAllowedError'

/**
 * Manages a collection of `Route` instances.
 *
 * @template IncomingEventType - The type of incoming HTTP events.
 * @template OutgoingResponseType - The type of outgoing HTTP responses.
 */
export class RouteCollection<
  IncomingEventType extends IIncomingEvent = IIncomingEvent,
  OutgoingResponseType = unknown
> {
  /**
   * A map of all routes using a unique key combining method and path.
   */
  private readonly routes: Map<string, Route<IncomingEventType, OutgoingResponseType>> = new Map()

  /**
   * A map of named routes for quick lookup by name.
   */
  private readonly nameList: Map<string, Route<IncomingEventType, OutgoingResponseType>> = new Map()

  /**
   * A map of routes grouped by HTTP methods.
   */
  private readonly methodList: Map<string, Map<string, Route<IncomingEventType, OutgoingResponseType>>> = new Map()

  /**
   * Factory method to create a `RouteCollection` instance.
   *
   * @param routes - Optional array of `Route` instances to initialize the collection.
   * @returns A new `RouteCollection` instance.
   */
  static create<
    IncomingEventType extends IIncomingEvent = IIncomingEvent,
    OutgoingResponseType = unknown
  >(routes?: Array<Route<IncomingEventType, OutgoingResponseType>>): RouteCollection<IncomingEventType, OutgoingResponseType> {
    return new this(routes)
  }

  /**
   * Constructs a `RouteCollection` instance.
   *
   * @param routes - Optional array of `Route` instances to initialize the collection.
   */
  constructor (routes?: Array<Route<IncomingEventType, OutgoingResponseType>>) {
    if (Array.isArray(routes)) {
      routes.forEach((route) => this.add(route))
    }
  }

  /**
   * Retrieves the total number of routes in the collection.
   */
  public get size (): number {
    return this.getRoutes().length
  }

  /**
   * Adds a `Route` to the collection.
   *
   * @param route - The `Route` to add.
   * @returns The updated `RouteCollection` instance.
   */
  public add (route: Route<IncomingEventType, OutgoingResponseType>): this {
    this.addToCollections(route)
    this.addToMethodList(route)
    this.addToNameList(route)
    return this
  }

  /**
   * Matches a `Route` based on an incoming event.
   *
   * @param event - The incoming HTTP event.
   * @param includingMethod - Whether to consider the HTTP method during matching. Defaults to `true`.
   * @returns The matched `Route`.
   * @throws {RouteNotFoundError} If no route matches the event.
   */
  public match (event: IncomingEventType, includingMethod: boolean = true): Route<IncomingEventType, OutgoingResponseType> {
    const routes = this.getRoutesByMethod(event.method)
    const route = this.matchAgainstRoutes(routes, event, includingMethod)
    return this.handleMatchedRoute(event, route)
  }

  /**
   * Checks if a named route exists.
   *
   * @param name - The name of the route.
   * @returns `true` if the named route exists, `false` otherwise.
   */
  public hasNamedRoute (name: string): boolean {
    return this.nameList.has(name)
  }

  /**
   * Retrieves a route by name.
   *
   * @param name - The name of the route.
   * @returns The corresponding `Route`, or `undefined` if not found.
   */
  public getByName (name: string): Route<IncomingEventType, OutgoingResponseType> | undefined {
    return this.nameList.get(name)
  }

  /**
   * Retrieves all routes for a given HTTP method.
   *
   * @param method - The HTTP method.
   * @returns An array of matching routes.
   */
  public getRoutesByMethod (method: string): Array<Route<IncomingEventType, OutgoingResponseType>> {
    return Array.from(this.methodList.get(method.toUpperCase())?.values() ?? [])
  }

  /**
   * Retrieves all registered routes as an array.
   *
   * @returns An array of all routes.
   */
  public getRoutes (): Array<Route<IncomingEventType, OutgoingResponseType>> {
    return Array.from(this.routes.values())
  }

  /**
   * Dumps all routes as an array of JSON objects.
   *
   * @returns An array of route definitions.
   */
  public async dump (): Promise<Array<Record<string, unknown>>> {
    const result: Array<Record<string, string>> = []

    for (const [method, routeMap] of this.methodList.entries()) {
      const routes = this.removeInternalHeaders(Array.from(routeMap.values()))
      for (const route of routes) {
        const routeJson = await route.toJSON()
        result.push({ ...routeJson, method })
      }
    }

    return result.sort((a, b) => a.path?.localeCompare(b.path))
  }

  /**
   * Converts all routes to a JSON string.
   *
   * @returns A JSON string representing all routes.
   */
  public async toString (): Promise<string> {
    return JSON.stringify(await this.dump())
  }

  /**
   * Implements the iterable protocol for iterating over routes.
   *
   * @returns An iterator for the routes.
   */
  public [Symbol.iterator] (): Iterator<Route<IncomingEventType, OutgoingResponseType>> {
    let index = -1
    const routes = this.getRoutes()

    return {
      next: (): IteratorResult<Route<IncomingEventType, OutgoingResponseType>> => ({
        value: routes[++index],
        done: !(index in routes)
      })
    }
  }

  private addToCollections (route: Route<IncomingEventType, OutgoingResponseType>): void {
    const key = `${String(route.getOption('method'))}.${String(route.getOption('path'))}`
    const existing = this.routes.get(key)

    // Fail fast on a genuine duplicate (same method + path) instead of silently
    // overwriting it, which was near-impossible to debug. The auto-derived HEAD
    // route (`isInternalHeader`) may always be superseded by an explicit one.
    if (
      existing !== undefined &&
      existing.getOption<boolean>('isInternalHeader') !== true &&
      route.getOption<boolean>('isInternalHeader') !== true
    ) {
      throw new RouterError(`Duplicate route detected for "${key}". Two routes cannot share the same method and path.`)
    }

    this.routes.set(key, route)
  }

  private addToMethodList (route: Route<IncomingEventType, OutgoingResponseType>): void {
    const path = route.getOption<string>('path')
    const method = route.getOption<string>('method')

    if (method !== undefined && path !== undefined) {
      !this.methodList.has(method) && this.methodList.set(method, new Map())
      this.methodList.get(method)?.set(path, route)
    }
  }

  private addToNameList (route: Route<IncomingEventType, OutgoingResponseType>): void {
    const name = route.getOption<string>('name')
    name !== undefined && this.nameList.set(name, route)
  }

  private matchAgainstRoutes (
    routes: Array<Route<IncomingEventType, OutgoingResponseType>>,
    event: IncomingEventType,
    includingMethod: boolean
  ): Route<IncomingEventType, OutgoingResponseType> | undefined {
    return routes
      .slice()
      .sort((a, b) => {
        // Fallback routes are always evaluated last.
        const fallbackDelta = (a.isFallback() ? 1 : 0) - (b.isFallback() ? 1 : 0)
        if (fallbackDelta !== 0) { return fallbackDelta }
        // Otherwise the most specific route wins (static > required > optional > catch-all),
        // deterministically and independently of declaration order.
        return b.getScore() - a.getScore()
      })
      .find(route => route.matches(event, includingMethod))
  }

  private handleMatchedRoute (event: IncomingEventType, route?: Route<IncomingEventType, OutgoingResponseType>): Route<IncomingEventType, OutgoingResponseType> {
    if (route !== undefined) return route

    const others = this.checkForAlternateVerbs(event)

    if (others.length > 0) return this.getRouteForMethods(event, others)

    throw new RouteNotFoundError(`Route ${String(event.decodedPathname)} could not be found.`)
  }

  private checkForAlternateVerbs (event: IncomingEventType): string[] {
    return HTTP_METHODS.filter(
      method =>
        method.toUpperCase() !== event.method?.toUpperCase() &&
        this.matchAgainstRoutes(
          this.removeInternalHeaders(this.getRoutesByMethod(method)),
          event,
          false
        ) !== undefined
    )
  }

  private removeInternalHeaders (routes: Array<Route<IncomingEventType, OutgoingResponseType>>): Array<Route<IncomingEventType, OutgoingResponseType>> {
    return routes.filter(route => !route.getOption<boolean>('isInternalHeader', false))
  }

  private getRouteForMethods (event: IncomingEventType, methods: string[]): Route<IncomingEventType, OutgoingResponseType> {
    const allow = methods.join(', ')

    if (event.isMethod?.('OPTIONS')) {
      return Route.create<IncomingEventType, OutgoingResponseType>({
        method: 'OPTIONS',
        path: event.decodedPathname ?? event.pathname,
        handler: (_event: IncomingEventType) => ({
          statusText: '',
          statusCode: 200,
          headers: { Allow: allow },
          content: ''
        } as unknown as OutgoingResponseType)
      })
    }

    // Carry the allowed methods on the error so the error handler can emit the
    // mandatory `Allow` header (RFC 7231 §6.5.5), not only a text message.
    throw new MethodNotAllowedError(
      `Method ${String(event.method)} is not supported for ${String(event.decodedPathname)}. Supported methods: ${allow}.`,
      { metadata: { allowedMethods: methods } }
    )
  }
}
