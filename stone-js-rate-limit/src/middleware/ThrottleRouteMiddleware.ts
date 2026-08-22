import { THROTTLE_KEY } from '../decorators/constants'
import { RateLimitManager } from '../RateLimitManager'
import { RateLimitError } from '../errors/RateLimitError'
import { hashSubject, IP_BACKSTOP_FACTOR, normalizeAddress, retryAfterSeconds, scopeOf, RouteLike } from '../utils'
import { RateLimitConfig, RateLimitInput, RateLimitRule } from '../declarations'
import {
  ClassType, IBlueprint, IContainer, ILogger, IncomingEvent, NextMiddleware, OutgoingResponse,
  getMetadata, hasMetadata, type MetaMiddleware
} from '@stone-js/core'

/** Where a caller stands against one budget, as the headers report it. */
interface Budget {
  limit: number
  remaining?: number
  resetAt: number
}

/** The shape this module reads from an event, duck-typed: the kernel is agnostic. */
interface ThrottledEvent extends IncomingEvent {
  ip?: string
  pathname?: string
  getHeader?: <T = string>(name: string, fallback?: T) => T | undefined
  getRoute?: () => RouteLike | undefined
  getUser?: <T>() => T | undefined
}

/**
 * Enforces what a route declared about its budget.
 *
 * On the router layer, and outside every other route middleware, because rejecting early is the entire
 * point: a caller past its budget must not reach authentication, a database or a mail provider. That
 * ordering is the difference between a limit that protects a system and a limit that merely reports on
 * it after the work is done.
 */
export class ThrottleRouteMiddleware {
  private readonly blueprint: IBlueprint
  private readonly container?: IContainer

  /**
   * @param dependencies - Auto-wired services.
   */
  constructor ({ blueprint, container }: { blueprint: IBlueprint, container?: IContainer }) {
    this.blueprint = blueprint
    this.container = container
  }

  /**
   * @param event - The incoming event.
   * @param next - The next middleware.
   * @returns The outgoing response.
   */
  async handle (event: IncomingEvent, next: NextMiddleware<IncomingEvent, OutgoingResponse>): Promise<OutgoingResponse> {
    const rules = this.rulesFor(event as ThrottledEvent)

    if (rules.length === 0) { return await next(event) }

    const spent = await this.enforce(event as ThrottledEvent, rules)
    const response = await next(event)

    return this.publish(response, spent)
  }

  /**
   * Count every declared rule, and refuse on the first one exceeded.
   *
   * A chain of rules is a conjunction, enforced in declaration order: a group's budget before a
   * route's, for the same reason the group's guard runs first. The first refusal answers and the rest
   * are never counted, so a caller already over one budget does not consume the others.
   *
   * @param event - The incoming event.
   * @param rules - What was declared, outermost first.
   * @returns The budget closest to being exceeded, for the headers.
   * @throws {RateLimitError} When a budget is spent.
   */
  private async enforce (event: ThrottledEvent, rules: RateLimitRule[]): Promise<Budget | undefined> {
    const manager = this.manager()
    const scope = scopeOf(event.getRoute?.(), event.pathname ?? 'unknown')
    let tightest: Budget | undefined

    for (const rule of rules) {
      const windowMs = Math.max(1, rule.window) * 1000
      const subject = this.subjectOf(event, rule)

      // Every rule counts in a bucket of its own. Two rules that shared one counter would each spend
      // the other's allowance, so a group's generous budget would exhaust a route's strict one on the
      // very first request: the limit that fired would be neither of the two that were declared.
      //
      // A rule that names a scope is counted there instead of per route, which is how a ceiling shared
      // by several routes is expressed. See `RateLimitRule.scope`.
      const bucket = `${rule.scope ?? scope}|${rule.max}|${windowMs}|${rule.by ?? 'address'}`

      // The subject's own budget, which is the real guarantee.
      if (subject !== undefined) {
        const hit = await manager.hit(`${bucket}:${subject}`, rule.max, windowMs, rule.limiter)
        this.refuseIfSpent(hit, rule.max, { scope, by: rule.by })
        tightest = this.tighter(tightest, { limit: rule.max, remaining: hit.remaining, resetAt: hit.resetAt })
      }

      // The address bucket: the whole budget when no subject was named, a loose backstop against bulk
      // enumeration when one was. Generous on purpose, because a shared address is the normal case on
      // a mobile network, not the exception.
      const addressLimit = this.addressLimitFor(rule, subject !== undefined)

      if (addressLimit !== undefined) {
        const address = this.addressOf(event)
        const hit = await manager.hit(`${bucket}:address:${address}`, addressLimit, windowMs, rule.limiter)
        this.refuseIfSpent(hit, addressLimit, { scope, address })
        tightest = this.tighter(tightest, { limit: addressLimit, remaining: hit.remaining, resetAt: hit.resetAt })
      }
    }

    return tightest
  }

  /**
   * How much the address bucket allows for this rule, or nothing when it does not apply.
   *
   * @param rule - What was declared.
   * @param hasSubject - Whether this request carried the subject the rule names.
   * @returns The limit to count the address against.
   */
  private addressLimitFor (rule: RateLimitRule, hasSubject: boolean): number | undefined {
    // A rule that names no subject bills the address for the whole budget: it is the only identity
    // the request offers.
    if ((rule.by ?? 'address') === 'address') { return rule.max }

    const factor = typeof rule.backstop === 'number' ? rule.backstop : IP_BACKSTOP_FACTOR
    const backstop = Math.max(1, Math.round(rule.max * factor))

    // A request that carries no subject still has to be bounded, whatever the rule said about the
    // backstop: skipping the address bucket here would make *omitting a field* the way to buy an
    // unlimited budget. It is billed at the looser backstop rather than the strict per-subject limit,
    // because on a shared address the strict limit punishes hundreds of unrelated callers for one
    // malformed request.
    if (!hasSubject) { return backstop }

    return rule.backstop === false ? undefined : backstop
  }

  /**
   * Of two budgets, the one closest to being exceeded.
   *
   * With several rules in play there is one honest answer to "where do I stand", and it is the
   * tightest: publishing a roomier budget would invite a caller straight into a refusal.
   *
   * @param current - The tightest so far.
   * @param candidate - Another budget.
   * @returns The tighter of the two.
   */
  private tighter (current: Budget | undefined, candidate: Budget): Budget {
    if (current === undefined) { return candidate }

    const left = current.remaining ?? Number.POSITIVE_INFINITY
    const right = candidate.remaining ?? Number.POSITIVE_INFINITY

    return right < left ? candidate : current
  }

  /**
   * Refuse a spent budget, saying when to come back.
   *
   * @param hit - What the limiter answered.
   * @param limit - The limit it was counted against.
   * @param context - What to log, minus anything identifying.
   * @throws {RateLimitError} When the hit was refused.
   */
  private refuseIfSpent (
    hit: { allowed: boolean, resetAt: number },
    limit: number,
    context: Record<string, unknown>
  ): void {
    if (hit.allowed) { return }

    const retryAfter = retryAfterSeconds(hit.resetAt)

    // No subject, no address in clear, no body: enough to see abuse, nothing to leak. A log line is
    // read by more people than a database row.
    this.logger()?.warn('Rate limit exceeded', { ...context, limit, retryAfter })

    throw new RateLimitError('Too many requests.', { retryAfter, resetAt: hit.resetAt, limit })
  }

  /**
   * What the budget belongs to for this rule, hashed.
   *
   * `address` is not a subject: it is the fallback the caller cannot choose, handled by the address
   * bucket. A field spec accepts alternatives (`'phone|email'`), first present wins, each prefixed by
   * its field name so a phone and an email can never collide on one bucket.
   *
   * @param event - The incoming event.
   * @param rule - What was declared.
   * @returns The subject key, or nothing when the rule names none or the request carries none.
   */
  private subjectOf (event: ThrottledEvent, rule: RateLimitRule): string | undefined {
    const by = rule.by ?? 'address'

    if (by === 'address') { return undefined }

    if (by === 'user') {
      const user = event.getUser?.<{ id?: unknown }>()
      const hashed = hashSubject(typeof user === 'object' && user !== null ? String((user as any).id ?? '') : user)
      return hashed === undefined ? undefined : `user:${hashed}`
    }

    for (const field of by.split('|')) {
      const name = field.trim()
      const hashed = hashSubject(event.get<string>(name, ''))
      if (hashed !== undefined) { return `${name}:${hashed}` }
    }

    // A rule that wanted a subject and did not get one falls through to the address bucket, at the
    // looser backstop: a malformed request must not spend the strict per-subject budget, and must not
    // be waved through either.
    return undefined
  }

  /**
   * The caller's address, from a header the application says it trusts, else the transport's own.
   *
   * A forwarded header is client-spoofable unless a proxy overwrites it, so none is read unless the
   * application named it: reading one by default would hand every caller an unlimited supply of
   * identities, which is a limiter that only looks like one.
   *
   * @param event - The incoming event.
   * @returns The address to key on.
   */
  private addressOf (event: ThrottledEvent): string {
    const trusted = this.options().trustedAddressHeaders ?? []

    for (const header of trusted) {
      const value = event.getHeader?.<string>(header)
      if (typeof value === 'string' && value.trim() !== '') { return normalizeAddress(value) }
    }

    return normalizeAddress(event.ip ?? 'unknown')
  }

  /**
   * Tell the caller where it stands, when the response can carry headers.
   *
   * @param response - What the handler answered.
   * @param spent - What the last counted hit reported.
   * @returns The response.
   */
  private publish (response: OutgoingResponse, spent?: Budget): OutgoingResponse {
    const setHeader = (response as unknown as { setHeader?: (name: string, value: string) => unknown }).setHeader

    if (spent === undefined || this.options().headers === false || typeof setHeader !== 'function') {
      return response
    }

    setHeader.call(response, 'RateLimit-Limit', String(spent.limit))
    setHeader.call(response, 'RateLimit-Remaining', String(spent.remaining ?? 0))
    setHeader.call(response, 'RateLimit-Reset', String(retryAfterSeconds(spent.resetAt)))

    return response
  }

  /**
   * What this event is throttled by: the route's declaration, else the handler's, else the global rule.
   *
   * Both places are read for the same reason the contract derivation reads both: a route is the single
   * description of itself when a router is in play, and a handler decorated with `@Throttle` is the
   * form that needs no router at all.
   *
   * @param event - The incoming event.
   * @returns The rules to enforce, outermost first.
   */
  private rulesFor (event: ThrottledEvent): RateLimitRule[] {
    const route = event.getRoute?.()
    const onRoute = route?.getOption<RateLimitInput>('rateLimit')

    if (onRoute !== undefined) { return [onRoute].flat() }

    const fromHandler = this.fromHandler(route)
    if (fromHandler !== undefined) { return [fromHandler].flat() }

    const global = this.options().global

    return global === undefined ? [] : [global]
  }

  /**
   * What the handler about to run declared with `@Throttle`.
   *
   * @param route - The matched route, when there is one.
   * @returns The declaration, or nothing.
   */
  private fromHandler (route: RouteLike | undefined): RateLimitInput | undefined {
    const handler = route?.getOption<{ module?: ClassType, action?: string | symbol }>('handler') ??
      this.blueprint.get<{ module?: ClassType, action?: string | symbol }>('stone.kernel.eventHandler', {})
    const module = handler?.module

    if (module === undefined || !hasMetadata(module, THROTTLE_KEY)) { return undefined }

    const declarations = getMetadata<ClassType, Array<{ action?: string | symbol, rateLimit: RateLimitInput }>>(module, THROTTLE_KEY, [])
    const action = handler?.action

    return (
      action === undefined
        ? declarations[0]
        : declarations.find((declaration) => declaration.action === action)
    )?.rateLimit
  }

  /** The `stone.rateLimit` bucket. */
  private options (): RateLimitConfig {
    return this.blueprint.get<RateLimitConfig>('stone.rateLimit', {})
  }

  /** The manager, from the container when there is one. */
  private manager (): RateLimitManager {
    const fromContainer = this.container?.has?.(RateLimitManager) === true
      ? this.container.make<RateLimitManager>(RateLimitManager)
      : undefined

    return fromContainer ?? RateLimitManager.getInstance() ?? RateLimitManager.create()
  }

  /** The logger, when one is bound. */
  private logger (): ILogger | undefined {
    return this.container?.has?.('logger') === true ? this.container.make<ILogger>('logger') : undefined
  }
}

/**
 * Meta middleware for a route's declared budget.
 *
 * On `stone.router.middleware` with the lowest priority of the route layer, so it runs before
 * authentication, authorization and validation: rejecting a caller past its budget is worth nothing
 * once the expensive work has already been done.
 */
export const MetaThrottleRouteMiddleware: MetaMiddleware<any, any> = {
  module: ThrottleRouteMiddleware,
  isClass: true,
  priority: 1
}
