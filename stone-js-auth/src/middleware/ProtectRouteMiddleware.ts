import { JwtClaims } from '../declarations'
import { normalizeScopes } from './guards'
import { PROTECT_KEY } from '../decorators/constants'
import { ProtectInput, ProtectMetadata } from '../decorators/Protect'
import { AuthenticationError, InsufficientScopeError } from '../errors/AuthErrors'
import {
  ClassType, IBlueprint, IncomingEvent, NextMiddleware, OutgoingResponse,
  getMetadata, hasMetadata, type MetaMiddleware
} from '@stone-js/core'

/**
 * Route middleware: enforce what a route or a handler declared it requires.
 *
 * ```ts
 * @Get('/me', { auth: true })
 * @Get('/tasks', { auth: 'tasks:write' })
 * ```
 *
 * The requirement is declared, not wired: that is what makes it readable. A guard buried in a
 * middleware list protects the endpoint but tells nothing else about it, so the contract cannot say
 * the endpoint is protected and a caller reads its 401 as a bug. Declared on the route or the handler,
 * the same fact serves both the runtime and the documentation.
 *
 * Anonymous callers get an `AuthenticationError` (401); an authenticated caller missing a scope gets
 * an `InsufficientScopeError` (403). Routes that declare nothing pass straight through.
 */
export class ProtectRouteMiddleware {
  private readonly blueprint: IBlueprint

  /**
   * @param dependencies - Auto-wired container services.
   */
  constructor ({ blueprint }: { blueprint: IBlueprint }) {
    this.blueprint = blueprint
  }

  /**
   * Enforce the declared requirement, then continue.
   *
   * @param event - The incoming event.
   * @param next - The next middleware.
   * @returns The response.
   */
  async handle (event: IncomingEvent, next: NextMiddleware<IncomingEvent, OutgoingResponse>): Promise<OutgoingResponse> {
    const required = this.requirementFor(event)

    if (required !== undefined) {
      const claims = event.getMetadataValue<JwtClaims>('auth')

      if (claims === undefined) {
        throw new AuthenticationError('Authentication required.')
      }

      const scopes = required === true ? [] : [required].flat()
      const granted = normalizeScopes(claims.scope)
      const missing = scopes.filter((scope) => !granted.includes(scope))

      if (missing.length > 0) {
        throw new InsufficientScopeError(`Missing required scope(s): ${missing.join(', ')}.`)
      }
    }

    return await next(event)
  }

  /**
   * What the route or the handler about to run requires.
   *
   * The route's own option comes first, because when a router is in play a route is the single
   * description of itself. Failing that, the handler's own `@Protect` metadata is read.
   *
   * @param event - The incoming event.
   * @returns The requirement, or `undefined` when nothing is required.
   */
  private requirementFor (event: IncomingEvent): ProtectInput | undefined {
    // Duck-typed throughout: the kernel is agnostic, and an event without a router carries no route.
    const route = (event as unknown as {
      getRoute?: () => { getOption?: <T>(k: string) => T } | undefined
    }).getRoute?.()

    const onRoute = route?.getOption?.<ProtectInput>('auth')
    if (onRoute !== undefined) { return onRoute }

    const handler = route?.getOption?.<{ module?: ClassType, action?: string | symbol }>('handler') ??
      this.blueprint.get<{ module?: ClassType, action?: string | symbol }>('stone.kernel.eventHandler', {})

    const module = handler?.module
    if (module === undefined || !hasMetadata(module, PROTECT_KEY)) { return undefined }

    const declarations = getMetadata<ClassType, ProtectMetadata[]>(module, PROTECT_KEY, [])
    const action = handler?.action

    return (
      action === undefined
        ? declarations[0]
        : declarations.find((declaration) => declaration.action === action)
    )?.auth
  }
}

/**
 * Meta middleware for route-declared authentication requirements.
 *
 * Its priority puts it ahead of validation: there is no point parsing a payload for a caller who is
 * not allowed to send one.
 */
export const MetaProtectRouteMiddleware: MetaMiddleware<any, any> = {
  module: ProtectRouteMiddleware,
  isClass: true,
  priority: 3
}
