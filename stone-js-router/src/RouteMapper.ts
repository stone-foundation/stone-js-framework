import {
  IMatcher,
  HttpMethod,
  IBoundModel,
  IDispatchers,
  IIncomingEvent,
  ProtocolPolicy,
  BindingResolver,
  RouteDefinition,
  DependencyResolver,
  FunctionalEventHandler
} from './declarations'
import { Route, RouteOptions } from './Route'
import { RouterError } from './errors/RouterError'
import { GET, HEAD, HTTP_METHODS } from './constants'
import { isFunctionModule, isNotEmpty } from '@stone-js/core'

/**
 * Configuration options for the RouteMapper.
 */
export interface RouteMapperOptions<
  IncomingEventType extends IIncomingEvent = IIncomingEvent,
  OutgoingResponseType = unknown
> {
  prefix?: string
  strict?: boolean
  maxDepth: number
  protocolPolicy?: ProtocolPolicy
  rules?: Record<string, RegExp>
  defaults?: Record<string, unknown>
  dependencyResolver?: DependencyResolver
  bindings?: Record<string, IBoundModel | BindingResolver>
  dispatchers: IDispatchers<IncomingEventType, OutgoingResponseType>
  matchers: Array<IMatcher<IncomingEventType, OutgoingResponseType>>
}

/**
 * Maps route definitions into concrete `Route` instances.
 *
 * @template IncomingEventType - Represents the type of incoming HTTP events.
 * @template OutgoingResponseType - Represents the type of outgoing HTTP responses.
 */
export class RouteMapper<
  IncomingEventType extends IIncomingEvent = IIncomingEvent,
  OutgoingResponseType = unknown
> {
  /**
   * Factory method to create a RouteMapper instance.
   *
   * @param options - Configuration options for the RouteMapper.
   * @returns A new RouteMapper instance.
   */
  static create<
    IncomingEventType extends IIncomingEvent = IIncomingEvent,
    OutgoingResponseType = unknown
  >(options: RouteMapperOptions<IncomingEventType, OutgoingResponseType>): RouteMapper<IncomingEventType, OutgoingResponseType> {
    return new this(options)
  }

  /**
   * Constructs a RouteMapper instance.
   *
   * @param options - Configuration options for the RouteMapper.
   * @throws {RouterError} If `maxDepth` is not a positive integer.
   */
  constructor (
    private readonly options: RouteMapperOptions<IncomingEventType, OutgoingResponseType>
  ) {
    if (options.maxDepth <= 0) {
      throw new RouterError('Maximum depth must be a positive integer.')
    }
  }

  /**
   * Maps route definitions into Route instances.
   *
   * @param definitions - An array of route definitions.
   * @returns An array of Route instances.
   */
  toRoutes (
    definitions: Array<RouteDefinition<IncomingEventType, OutgoingResponseType>>
  ): Array<Route<IncomingEventType, OutgoingResponseType>> {
    return this
      .flattenDefinitions(definitions)
      .map((definition) =>
        Route
          .create<IncomingEventType, OutgoingResponseType>(this.toRouteOptions(definition))
          .setMatchers(this.options.matchers)
          .setDispatchers(this.options.dispatchers)
          .setResolver(this.options.dependencyResolver)
      )
  }

  /**
   * Flattens nested route definitions.
   *
   * @param definitions - An array of route definitions.
   * @param depth - Current recursion depth.
   * @returns An array of flattened route definitions.
   * @throws {RouterError} If maximum depth is exceeded.
   */
  private flattenDefinitions (
    definitions: Array<RouteDefinition<IncomingEventType, OutgoingResponseType>>,
    depth: number = 0
  ): Array<RouteDefinition<IncomingEventType, OutgoingResponseType>> {
    if (depth >= this.options.maxDepth) {
      throw new RouterError(`Maximum route definition depth of ${String(this.options.maxDepth)} exceeded.`)
    }

    depth++

    return definitions
      .flatMap((def) => [def.path].flat().filter(Boolean).map((path) => ({ ...def, path })))
      .flatMap((def) => this.gathersMethods(def).map((method) => ({ ...def, method })))
      .flatMap((def) => [def.protocol].flat().map((protocol) => ({ ...def, protocol })))
      .flatMap((def) => [def.domain].flat().map((domain) => ({ ...def, domain })))
      .flatMap((def) => {
        if (!Array.isArray(def.children) || def.children.length === 0) {
          return def.method === GET ? [def, { ...def, isInternalHeader: true, method: HEAD }] : def
        }
        return this
          .flattenDefinitions(def.children, depth)
          .map((child) => this.mergeDefinitions(def, child))
      })
  }

  /**
   * Gathers all HTTP methods for a route definition.
   *
   * @param definition - The route definition to gather HTTP methods from.
   * @returns An array of HTTP methods
   */
  private gathersMethods ({ method, methods }: RouteDefinition<IncomingEventType, OutgoingResponseType>): HttpMethod[] {
    const values = [method, methods].flat().filter(v => isNotEmpty<HttpMethod>(v))
    values.length === 0 && values.push(GET)
    return values
  }

  /**
   * Merges parent and child route definitions.
   *
   * @param parent - The parent route definition.
   * @param child - The child route definition.
   * @returns A merged route definition.
   */
  private mergeDefinitions (
    parent: RouteDefinition<IncomingEventType, OutgoingResponseType>,
    child: RouteDefinition<IncomingEventType, OutgoingResponseType>
  ): RouteDefinition<IncomingEventType, OutgoingResponseType> {
    child.rules = { ...parent.rules, ...child.rules }
    child.defaults = { ...parent.defaults, ...child.defaults }
    child.bindings = { ...parent.bindings, ...child.bindings }
    child.name = [parent.name, child.name].filter(Boolean).join('.')
    child.path = ['/', parent.path, child.path].filter(Boolean).join('/')
    child.middleware = [child.middleware, parent.middleware].flat().filter((v) => v !== undefined)
    child.excludeMiddleware = [child.excludeMiddleware, parent.excludeMiddleware].flat().filter((v) => v !== undefined)

    if (
      child.handler !== undefined &&
      !isFunctionModule<FunctionalEventHandler<IncomingEventType, OutgoingResponseType>>(parent.handler) &&
      !isFunctionModule<FunctionalEventHandler<IncomingEventType, OutgoingResponseType>>(child.handler)
    ) {
      child.handler = { ...parent.handler, ...child.handler }
    }

    return { ...parent, ...child }
  }

  /**
   * Convert and validates a route option.
   *
   * @param definition - The route definition to validate.
   * @returns The validated route options.
   * @throws {RouterError} If validation fails.
   */
  private toRouteOptions (definition: RouteDefinition<IncomingEventType, OutgoingResponseType>): RouteOptions<IncomingEventType, OutgoingResponseType> {
    if (definition.path === undefined) {
      throw new RouterError('Route definition must have a path')
    }
    if (definition.method === undefined || !HTTP_METHODS.includes(definition.method)) {
      throw new RouterError(`Invalid method(${String(definition.method)}), valid methods are(${String(HTTP_METHODS.join(','))})`)
    }
    // One of the following must be defined
    if (definition.handler === undefined && definition.redirect === undefined) {
      throw new RouterError('Route definition must have one of the following: action, or redirect')
    }

    return {
      ...definition as RouteOptions<IncomingEventType, OutgoingResponseType>,
      children: undefined,
      // Per-route value wins, global (`stone.router.protocolPolicy`) is the fallback —
      // symmetric with `strict`. Previously the global value always overrode the route's.
      protocolPolicy: definition.protocolPolicy ?? this.options.protocolPolicy,
      strict: definition.strict ?? this.options.strict,
      rules: { ...this.options.rules, ...definition.rules },
      bindings: { ...this.options.bindings, ...definition.bindings },
      defaults: { ...this.options.defaults, ...definition.defaults },
      name: definition.name?.replace(/\.{2,}/g, '.').replace(/^\.+|\.+$/g, ''),
      path: ['/', this.options.prefix, definition.path].filter(Boolean).join('/').replace(/\/{2,}/g, '/')
    }
  }
}
