import { IResource } from '../declarations'
import { contextFromEvent } from '../helpers'
import { ResourcesConfig } from '../options/ResourcesBlueprint'
import { IBlueprint, IncomingEvent, NextMiddleware, OutgoingResponse, type MetaMiddleware } from '@stone-js/core'

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

  /**
   * @param dependencies - Auto-wired container services.
   */
  constructor ({ blueprint }: { blueprint: IBlueprint }) {
    this.blueprint = blueprint
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
    // Duck-typed: the kernel is agnostic, and an event without a router carries no route at all.
    const declared = (event as unknown as { getRoute?: () => { getOption?: <T>(k: string) => T } })
      .getRoute?.()?.getOption?.<RouteResource>('resource')

    if (declared === undefined) { return undefined }
    if (typeof declared !== 'string') { return declared }

    const registry = this.blueprint.get<ResourcesConfig>('stone.resources', {}).registry ?? {}
    const resource = registry[declared]

    if (resource === undefined) {
      throw new TypeError(
        `The route declares \`resource: '${declared}'\`, but no resource is registered under that ` +
        'name. Register it with `blueprint.set(\'stone.resources.registry\', { ' + declared + ': … })`, ' +
        'or declare the resource inline on the route.'
      )
    }

    return resource
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
