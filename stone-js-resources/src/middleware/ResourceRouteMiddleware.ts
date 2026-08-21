import { contextFromEvent } from '../helpers'
import { IResource } from '../declarations'
import { RETURNS_KEY } from '../decorators/constants'
import { ReturnsMetadata } from '../decorators/Returns'
import { ResourcesConfig } from '../options/ResourcesBlueprint'
import {
  ClassType, IBlueprint, IContainer, IncomingEvent, NextMiddleware, OutgoingResponse,
  getMetadata, hasMetadata, type MetaMiddleware
} from '@stone-js/core'

/**
 * The shape a route's `resource` option may take: the resource itself, a class to resolve, or the
 * name of one registered under `stone.resources.registry`.
 */
export type RouteResource = IResource<any, any> | string

/** A response whose payload can be read and replaced without disturbing the rest of it. */
interface ContentBearing {
  content: unknown
  setContent: (content: unknown) => unknown
}

/**
 * Route middleware: shapes what a route returns, after its handler ran.
 *
 * A route says what it exposes, once, where the route is defined:
 *
 * ```ts
 * @Get('/users/:id', { resource: UserResource })
 * ```
 *
 * The handler returns its domain model, whole, and this applies the resource on the way out. That is
 * the point: a service should not have to know which fields are public, and a handler should not have
 * to remember to strip them.
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
   * It handles both of the things a handler may hand back, which is the part that used to be wrong. A
   * handler carrying a response decorator (`@JsonHttpResponse(201)`) has already been turned into a
   * response by the time any route middleware runs, because that decorator wraps the method itself.
   * Projecting the response object produced an empty payload and dropped the status with it. So a
   * response is now projected **through its content**, in place: the payload is shaped and the status,
   * the headers and everything else the handler chose are left exactly as they were.
   *
   * @param event - The incoming event.
   * @param next - The next middleware.
   * @returns The shaped output, or the untouched result when the route declares no resource.
   */
  async handle (event: IncomingEvent, next: NextMiddleware<IncomingEvent, OutgoingResponse>): Promise<OutgoingResponse> {
    const resource = this.resourceFor(event)
    const result = await next(event)

    if (resource === undefined || result === undefined || result === null) { return result }

    const context = contextFromEvent(event as any, this.blueprint, {
      onViolation: this.blueprint.get<ResourcesConfig>('stone.resources', {}).onViolation
    })

    if (this.isContentBearing(result)) {
      const shaped = await this.shapePayload(resource, result.content, context)
      result.setContent(shaped)
      return result
    }

    return await this.shapePayload(resource, result, context) as OutgoingResponse
  }

  /**
   * Shape a value, or shape what is inside the envelope the application declared.
   *
   * A page is `{ items: [...], meta: { total } }`, and `items` and `meta` are not fields of a model:
   * projecting that object would publish the envelope as if it were the thing. An application names its
   * own wrapper once, in `stone.resources.envelope`, and everything around the payload is left as it
   * was, counts and cursors included.
   *
   * Nothing is assumed when nothing is declared, because guessing which key holds the payload would
   * quietly mangle a model that happens to have one by that name.
   *
   * @param resource - The resource to apply.
   * @param value - The value the handler produced.
   * @param context - The resource context.
   * @returns The projected value, wrapper intact.
   */
  private async shapePayload (resource: IResource<any, any>, value: unknown, context: any): Promise<unknown> {
    const key = this.envelopeKeyOf(value)

    if (key === undefined) { return await this.shape(resource, value, context) }

    const envelope = value as Record<string, unknown>

    return { ...envelope, [key]: await this.shape(resource, envelope[key], context) }
  }

  /**
   * Which declared envelope key this value carries, if any.
   *
   * @param value - The value the handler produced.
   * @returns The key holding the payload, or nothing when this is not an envelope.
   */
  private envelopeKeyOf (value: unknown): string | undefined {
    const declared = this.blueprint.get<ResourcesConfig>('stone.resources', {}).envelope

    if (declared === undefined || typeof value !== 'object' || value === null || Array.isArray(value)) {
      return undefined
    }

    return [declared.payload].flat().find((candidate) => candidate in (value as Record<string, unknown>))
  }

  /**
   * Project a value, whether it is one model or many.
   *
   * @param resource - The resource to apply.
   * @param value - The value the handler produced.
   * @param context - The resource context.
   * @returns The projected value.
   */
  private async shape (resource: IResource<any, any>, value: unknown, context: any): Promise<unknown> {
    if (value === undefined || value === null) { return value }

    return Array.isArray(value)
      ? await resource.collection(value, context)
      : await resource.item(value, context)
  }

  /**
   * Whether a value is a response carrying a payload this can replace.
   *
   * Duck-typed: the kernel is agnostic, and each platform has its own response type.
   *
   * @param value - The value to test.
   * @returns Whether it carries content.
   */
  private isContentBearing (value: unknown): value is ContentBearing {
    return typeof value === 'object' && value !== null &&
      typeof (value as ContentBearing).setContent === 'function' &&
      'content' in value
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
   * the services it asked for — the validator it holds its own contract against, and whatever its
   * `data()` needs to complete a model.
   *
   * @param entry - A resource, or a class to resolve into one.
   * @returns The resource.
   */
  private resolve (entry: any): IResource<any, any> {
    if (typeof entry !== 'function') { return entry }
    const ResourceClass = entry
    // `resolve(Class, true)` uses the binding `@ApiResource` declared, and binds it as a singleton
    // when there is none, so a resource is built once with its dependencies wired either way.
    return this.container?.resolve?.(ResourceClass, true) ?? new ResourceClass()
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
