import { CAN_KEY } from '../decorators/constants'
import { isPolicy, isPolicyClass, IPolicy } from '../policy'
import { AuthzOptions, AppAbility } from '../declarations'
import { CanInput, CanMetadata } from '../decorators/Can'
import { AuthorizationError } from '../errors/AuthorizationError'
import {
  ClassType, IBlueprint, IContainer, IncomingEvent, NextMiddleware, OutgoingResponse,
  getMetadata, hasMetadata, type MetaMiddleware
} from '@stone-js/core'

/**
 * Name a subject for an error message.
 *
 * A subject is a string, a class or an instance, and `String(...)` on the last two yields
 * `[object Object]` — an authorization failure that says nothing about what was refused.
 *
 * @param subject - What the rule was checked against.
 * @returns Something worth reading.
 */
function describeSubject (subject: unknown): string {
  if (typeof subject === 'string') { return subject }
  if (typeof subject === 'function') { return subject.name }
  if (typeof subject === 'object' && subject !== null) { return subject.constructor.name }
  return String(subject)
}

/**
 * Route middleware: enforce what a route or a handler declared it authorizes.
 *
 * ```ts
 * @Delete('/posts/:id', { authz: { action: 'delete', subject: 'Post' } })
 * @Patch('/posts/:id', { authz: 'post.update' })   // a registered policy
 * ```
 *
 * An ability answers what a role may do and is checked against the ability `AbilityMiddleware`
 * attached. A **policy** answers what this caller may do to this record, so it receives the event and
 * is resolved by the container: "may update this post" needs the post, which an ability cannot load.
 *
 * Declared rather than wired, so the same fact serves the runtime and the contract: a guard hidden in
 * a middleware list protects the endpoint but tells nothing else about it.
 */
export class CanRouteMiddleware {
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
   * Enforce the declared rule, then continue.
   *
   * @param event - The incoming event.
   * @param next - The next middleware.
   * @returns The response.
   */
  async handle (event: IncomingEvent, next: NextMiddleware<IncomingEvent, OutgoingResponse>): Promise<OutgoingResponse> {
    const declared = this.ruleFor(event)

    if (declared !== undefined) {
      await this.enforce(event, declared)
    }

    return await next(event)
  }

  /**
   * Check the rule, whichever kind it is.
   *
   * @param event - The incoming event.
   * @param declared - The declared rule.
   * @throws {AuthorizationError} When the caller may not proceed.
   */
  private async enforce (event: IncomingEvent, declared: CanInput): Promise<void> {
    if (typeof declared === 'string') {
      const policy = this.policy(declared)
      if (!(await policy.authorize(event))) {
        throw new AuthorizationError(`The policy '${declared}' denied this request.`)
      }
      return
    }

    const { action, subject, field } = declared
    const ability = event.getMetadataValue<AppAbility>('ability')

    if (ability?.can === undefined || !ability.can(action as any, subject as any, field)) {
      throw new AuthorizationError(`Not allowed to ${String(action)} ${describeSubject(subject)}.`)
    }
  }

  /**
   * The policy registered under a name, built through the container so it gets its services.
   *
   * @param name - The registered name.
   * @returns The policy.
   * @throws {AuthorizationError} When no policy is registered under that name.
   */
  private policy (name: string): IPolicy {
    const registry = this.blueprint.get<AuthzOptions>('stone.authz', {}).policies ?? {}
    const entry = registry[name]

    if (entry === undefined) {
      throw new AuthorizationError(
        `The route declares \`authz: '${name}'\`, but no policy is registered under that name. ` +
        'Register one with `@Policy(\'' + name + '\')`, or name an ability instead. Denying is the ' +
        'only safe answer: a missing policy must never read as permission.'
      )
    }

    if (isPolicy(entry)) { return entry }
    if (!isPolicyClass(entry)) { return { authorize: () => false } }

    const PolicyClass = entry
    return this.container?.resolve?.(PolicyClass as any, true) ?? new PolicyClass({})
  }

  /**
   * What the route or the handler about to run authorizes.
   *
   * @param event - The incoming event.
   * @returns The rule, or `undefined` when nothing is declared.
   */
  private ruleFor (event: IncomingEvent): CanInput | undefined {
    // Duck-typed throughout: the kernel is agnostic, and an event without a router carries no route.
    const route = (event as unknown as {
      getRoute?: () => { getOption?: <T>(k: string) => T } | undefined
    }).getRoute?.()

    const onRoute = route?.getOption?.<CanInput>('authz')
    if (onRoute !== undefined) { return onRoute }

    const handler = route?.getOption?.<{ module?: ClassType, action?: string | symbol }>('handler') ??
      this.blueprint.get<{ module?: ClassType, action?: string | symbol }>('stone.kernel.eventHandler', {})

    const module = handler?.module
    if (module === undefined || !hasMetadata(module, CAN_KEY)) { return undefined }

    const declarations = getMetadata<ClassType, CanMetadata[]>(module, CAN_KEY, [])
    const action = handler?.action

    return (
      action === undefined
        ? declarations[0]
        : declarations.find((declaration) => declaration.action === action)
    )?.authz
  }
}

/**
 * Meta middleware for route-declared authorization.
 *
 * Its priority puts it just after authentication and ahead of validation: who the caller is, then
 * whether they may, then what they sent.
 */
export const MetaCanRouteMiddleware: MetaMiddleware<any, any> = {
  module: CanRouteMiddleware,
  isClass: true,
  priority: 4
}
