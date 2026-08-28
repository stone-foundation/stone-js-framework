import { THROTTLE_KEY } from '../decorators/constants'
import { RateLimitManager } from '../RateLimitManager'
import { RateLimitError } from '../errors/RateLimitError'
import { hashSubject, IP_BACKSTOP_FACTOR, normalizeAddress, retryAfterSeconds, scopeOf, RouteLike } from '../utils'
import { RateLimitConfig, RateLimitInput, RateLimitRule } from '../declarations'
import {
  ClassType, IBlueprint, IContainer, ILogger, IncomingEvent, NextMiddleware, OutgoingResponse,
  getMetadata, hasMetadata, type MetaMiddleware
} from '@stone-js/core'

/**
 * Whether a value says who it is when read as text.
 *
 * `String(value)` answers `'[object Object]'` for anything that never defined its own `toString`,
 * and that string makes a perfectly good bucket key: every caller carrying such a value would land
 * in the same bucket and spend each other's budget, which is the opposite of what a subject is for.
 * A value with its own `toString` (a `Date`, an object id from a database driver, an array) says
 * something distinct and is kept, and a function is never an identity whatever it stringifies to.
 *
 * Answering false sends the request to the address bucket, which is this module's designed
 * degradation and is warned about, rather than to a bucket shared with strangers, which is silent.
 *
 * @param value - Whatever a source answered.
 * @returns True when reading it as text identifies something.
 */
function identifies (value: unknown): boolean {
  if (typeof value === 'function') { return false }
  if (typeof value !== 'object' || value === null) { return true }

  const own = (value as { toString?: unknown }).toString

  return typeof own === 'function' && own !== Object.prototype.toString
}

/**
 * What a rule bills, as one word for a log line or a bucket key.
 *
 * A resolver is a function, and a function has no name worth reading in a key: every rule using one
 * would otherwise write its source into the bucket. `'resolver'` says which rule it was without
 * saying anything about the caller.
 *
 * @param by - What the rule declared.
 * @returns The label.
 */
function labelOf (by: RateLimitRule['by']): string {
  return typeof by === 'function' ? 'resolver' : String(by)
}

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
  // Read separately rather than through `get()`, which consults the route parameters first and
  // therefore raises before the router has bound the event. See `fieldOf`.
  getFromBody?: <T>(name: string, fallback?: T) => T | undefined
  getFromQueryParams?: <T>(name: string, fallback?: T) => T | undefined
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

    for (const declared of rules) {
      const rule = this.applied(declared, scope)
      const by = labelOf(rule.by)
      const windowMs = Math.max(1, rule.window) * 1000
      const subject = await this.subjectOf(event, rule)

      if (subject === undefined && rule.by !== 'address') {
        // The downgrade below is the right behaviour and the wrong silence. A rule that asked for a
        // subject and got none is now billed to the address at the backstop, so a budget of three
        // allows thirty, with no error and every test still green. On a shared address that means
        // unrelated callers paying for one, which is the failure this module exists to prevent.
        this.logger()?.warn(
          'Rate limit rule names a subject the request does not carry, falling back to the address bucket',
          { scope, by, limit: rule.max }
        )
      }

      // Every rule counts in a bucket of its own. Two rules that shared one counter would each spend
      // the other's allowance, so a group's generous budget would exhaust a route's strict one on the
      // very first request: the limit that fired would be neither of the two that were declared.
      //
      // A rule that names a scope is counted there instead of per route, which is how a ceiling shared
      // by several routes is expressed. See `RateLimitRule.scope`.
      const bucket = `${rule.scope ?? scope}|${rule.max}|${windowMs}|${by}`

      // The subject's own budget, which is the real guarantee.
      if (subject !== undefined) {
        const hit = await manager.hit(`${bucket}:${subject}`, rule.max, windowMs, rule.limiter)
        this.refuseIfSpent(hit, rule.max, { scope, by })
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
   * The rule as it will be enforced, with the one thing a type cannot guarantee filled in.
   *
   * `by` is required, and the type says so. It says so to TypeScript only, and Stone.js is
   * JavaScript as much as TypeScript, so the rule that matters most in this module cannot rest on a
   * type alone. A rule arriving without a subject is still enforced, on the address, and says out
   * loud that it is doing the one thing this module argues against.
   *
   * @param rule - What was declared.
   * @param scope - What it applies to, for the log.
   * @returns The rule to enforce.
   */
  private applied (rule: RateLimitRule, scope: string): RateLimitRule {
    if (rule.by !== undefined) { return rule }

    this.logger()?.warn(
      'Rate limit rule declares no `by`, so it is counted on the caller address. Name the subject ' +
      'it should belong to, or write `by: \'address\'` to say you meant it.',
      { scope, limit: rule.max, window: rule.window }
    )

    return { ...rule, by: 'address' }
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
    if (rule.by === 'address') { return rule.max }

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
  private async subjectOf (event: ThrottledEvent, rule: RateLimitRule): Promise<string | undefined> {
    const by = rule.by

    if (by === 'address') { return undefined }

    // A resolver the application supplied: it knows where its subject lives, and this module has no
    // business guessing. Prefixed so it can never collide with a field of the same name.
    if (typeof by === 'function') {
      const hashed = hashSubject(await this.attempt(async () => await by(event)))
      return hashed === undefined ? undefined : `subject:${hashed}`
    }

    if (by === 'user') {
      const hashed = hashSubject(await this.attempt(async () => await this.principalOf(event)))
      return hashed === undefined ? undefined : `user:${hashed}`
    }

    // A field spec accepts alternatives, first present wins, each prefixed by its field name so a
    // phone and an email can never land on one bucket.
    for (const field of by.split('|')) {
      const name = field.trim()
      const hashed = hashSubject(await this.attempt(async () => await this.fieldOf(event, name)))
      if (hashed !== undefined) { return `${name}:${hashed}` }
    }

    // A rule that wanted a subject and did not get one falls through to the address bucket, at the
    // looser backstop: a malformed request must not spend the strict per-subject budget, and must not
    // be waved through either. The caller logs it, because a silent downgrade is how a budget of
    // three came to allow thirty with every test still green.
    return undefined
  }

  /**
   * The authenticated principal, as the application resolves it.
   *
   * The default reads `event.getUser?.()` and takes its `id`, `sub` or `userId`: the three shapes a
   * principal almost always has, `sub` being the one a token carries. Anything else is what
   * `stone.rateLimit.principal` is for, because a framework that started inferring the shape of an
   * application's principal would be wrong for somebody on every release.
   *
   * @param event - The incoming event.
   * @returns The principal's identity, or nothing.
   */
  private async principalOf (event: ThrottledEvent): Promise<string | undefined> {
    const resolver = this.options().principal

    if (resolver !== undefined) { return await resolver(event) }

    const user = event.getUser?.<Record<string, unknown>>()

    if (typeof user !== 'object' || user === null) { return this.text(user) }

    return this.text(user.id ?? user.sub ?? user.userId)
  }

  /**
   * One field of the request, read in the order `event.get` reads it, minus the ways it can throw.
   *
   * `event.get()` cannot be used here. It consults the route parameters first, and on the router
   * layer the parameters are bound only **after** the route middleware have run, so it raises
   * "Event is not bound" for every field, a body field included. That turned a declared budget into
   * a 500 on the very route it was meant to protect. The router's own `findParam` does the
   * find-bind-read dance safely, and it is asked through the container so this module keeps knowing
   * nothing about the router.
   *
   * @param event - The incoming event.
   * @param name - The field to read.
   * @returns The value, or nothing.
   */
  private async fieldOf (event: ThrottledEvent, name: string): Promise<string | undefined> {
    const router = this.container?.has?.('router') === true
      ? this.container.make<{ findParam?: (event: unknown, name: string) => Promise<unknown> }>('router')
      : undefined

    const fromRoute = router?.findParam === undefined
      ? undefined
      : await this.attempt(async () => await router.findParam?.(event, name))

    return this.text(fromRoute) ??
      this.text(event.getFromBody?.<unknown>(name)) ??
      this.text(event.getFromQueryParams?.<unknown>(name))
  }

  /**
   * A value as a subject string, or nothing when it says nothing.
   *
   * @param value - Whatever a source answered.
   * @returns The value as text, or nothing.
   */
  private text (value: unknown): string | undefined {
    if (value === undefined || value === null || !identifies(value)) { return undefined }

    const text = String(value)

    return text === '' ? undefined : text
  }

  /**
   * Run a read that is allowed to fail, and answer nothing when it does.
   *
   * A limiter must degrade, never break the route it protects: a resolver an application wrote, a
   * router that cannot match, a body that never parsed. Whatever the reason, the request falls back
   * to the address bucket and the refusal path stays intact.
   *
   * @param read - The read to attempt.
   * @returns What it answered, or nothing.
   */
  private async attempt<T> (read: () => Promise<T>): Promise<T | undefined> {
    try {
      return await read()
    } catch (error: any) {
      this.logger()?.debug?.('Rate limit subject could not be read, falling back to the address', {
        reason: error?.message
      })
      return undefined
    }
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
