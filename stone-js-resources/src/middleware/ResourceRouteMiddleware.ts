import { IResource } from '../declarations'
import { contextFromEvent } from '../helpers'
import { RETURNS_KEY } from '../decorators/constants'
import { ReturnsMetadata } from '../decorators/Returns'
import { ResourcesConfig } from '../options/ResourcesBlueprint'
import {
  ClassType, IBlueprint, IContainer, IncomingEvent, NextMiddleware, OutgoingResponse,
  getMetadata, hasMetadata, type MetaMiddleware
} from '@stone-js/core'

/**
 * The shape a route's `resource` option may take: the resource itself, or the name of one
 * registered under `stone.resources.registry`.
 */
export type RouteResource = IResource<any, any> | string

/**
 * Route middleware: shapes what a route returns, after its handler ran.
 *
 * A route says what it exposes, once, where the route is defined:
 *
 * ```ts
 * @Get('/users/:id', { resource: userResource })
 * ```
 *
 * The handler then returns its domain model, whole, and this middleware applies the resource on the
 * way out. That is the point: a service should not have to know which fields are public, and a
 * handler should not have to remember to strip them. Whatever the model gains later, a password
 * hash, an internal flag, is not exposed by accident, because the resource decides what leaves.
 *
 * It runs on the raw value the handler returned, before any response wrapping, so it knows nothing
 * of HTTP and works in every context. Sparse fieldsets are read from the event, so `?fields=id,name`
 * narrows the output without the route changing.
 */
export class ResourceRouteMiddleware {
  private readonly blueprint: IBlueprint
  private readonly container?: IContainer

  /**
   * @param dependencies - Auto-wired container services.
   */
  constructor ({ blueprint, container }: { blueprint: IBlueprint, container?: IContainer }) {
    this.blueprint = blueprint
    this.container = container
  }

  /**
   * Run the handler, then shape what it returned.
   *
   * @param event - The incoming event.
   * @param next - The next middleware.
   * @returns The shaped output, or the untouched result when the route declares no resource.
   */
  async handle (event: IncomingEvent, next: NextMiddleware<IncomingEvent, OutgoingResponse>): Promise<OutgoingResponse> {
    const resource = this.resourceFor(event)
    const result = await next(event)

    if (resource === undefined || result === undefined || result === null) { return result }

    const context = contextFromEvent(event as any)

    return (
      Array.isArray(result) ? resource.collection(result, context) : resource.item(result, context)
    ) as unknown as OutgoingResponse
  }

  /**
   * The resource the matched route declared, with a registered name resolved to its resource.
   *
   * @param event - The incoming event.
   * @returns The resource, or `undefined` when the route declares none.
   */
  private resourceFor (event: IncomingEvent): IResource<any, any> | undefined {
    const declared = this.declarationFor(event)

    if (declared === undefined) { return undefined }
    if (typeof declared !== 'string') { return this.resolve(declared) }

    const registry = this.blueprint.get<ResourcesConfig>('stone.resources', {}).registry ?? {}
    const resource = registry[declared]

    if (resource === undefined) {
      throw new TypeError(
        `The route declares \`resource: '${declared}'\`, but no resource is registered under that ` +
        'name. Register it with `blueprint.set(\'stone.resources.registry\', { ' + declared + ': … })`, ' +
        'or declare the resource inline on the route.'
      )
    }

    return this.resolve(resource)
  }

  /**
   * What the handler about to run declared, from either of the two places it may live.
   *
   * The route's own option comes first, because when a router is in play a route is the single
   * description of itself. Failing that, the handler's own `@Returns` metadata is read: that form owns
   * its key and needs no router, so the same module shapes the output of a routed request, a
   * single-handler service, a CLI command or a browser event.
   *
   * @param event - The incoming event.
   * @returns What was declared, or `undefined`.
   */
  private declarationFor (event: IncomingEvent): RouteResource | undefined {
    // Duck-typed throughout: the kernel is agnostic, and an event without a router carries no route.
    const route = (event as unknown as {
      getRoute?: () => { getOption?: <T>(k: string) => T } | undefined
    }).getRoute?.()

    const onRoute = route?.getOption?.<RouteResource>('resource')
    if (onRoute !== undefined) { return onRoute }

    const handler = route?.getOption?.<{ module?: ClassType, action?: string | symbol }>('handler') ??
      this.blueprint.get<{ module?: ClassType, action?: string | symbol }>('stone.kernel.eventHandler', {})

    return this.declaredOnHandler(handler)
  }

  /**
   * What a handler declared with `@Returns`, if anything.
   *
   * @param handler - The handler about to run.
   * @returns What the matching method declared, or `undefined`.
   */
  private declaredOnHandler (
    handler?: { module?: ClassType, action?: string | symbol }
  ): RouteResource | undefined {
    const module = handler?.module
    if (module === undefined || !hasMetadata(module, RETURNS_KEY)) { return undefined }

    const declarations = getMetadata<ClassType, ReturnsMetadata[]>(module, RETURNS_KEY, [])
    const action = handler?.action

    // A single-handler module declares one; a controller declares one per method.
    return (
      action === undefined
        ? declarations[0]
        : declarations.find((declaration) => declaration.action === action)
    )?.resource
  }

  /**
   * Resolve a registered entry: a resource class goes through the container, so its constructor gets
   * the services it asked for and `toArray` can use them, i18n included.
   *
   * @param entry - A resource, or a class to resolve into one.
   * @returns The resource.
   */
  private resolve (entry: any): IResource<any, any> {
    if (typeof entry !== 'function') { return entry }
    const ResourceClass = entry
    return this.container?.resolve?.(ResourceClass, true) ?? new ResourceClass({})
  }
}

/**
 * Meta middleware for route-declared resources.
 *
 * Registered on `stone.router.middleware` by `resourcesBlueprint`. Its priority puts it outside
 * validation, so a request is shaped on the way out after having been validated on the way in.
 */
export const MetaResourceRouteMiddleware: MetaMiddleware<any, any> = {
  module: ResourceRouteMiddleware,
  isClass: true,
  priority: 4
}
