/**
 * What one counted hit answers.
 */
export interface RateLimitHit {
  /** Whether this request may proceed. */
  allowed: boolean
  /** Epoch ms at which the current window resets. */
  resetAt: number
  /** How much of the budget is left after this hit, when the driver can say. */
  remaining?: number
}

/**
 * A limiter: something that counts hits against a key and says whether one may proceed.
 *
 * The limit is passed in rather than held by the limiter, deliberately. An implementation that can
 * refuse **atomically**, through a conditional write, has to know the limit to express the condition,
 * and refusing without writing is what stops a flood from costing one write per rejected request.
 * A limiter that increments and then compares pays for every refusal and lets the counter climb
 * without bound inside the window.
 */
export interface RateLimiter {
  /**
   * Count one hit against `key` and say whether it may proceed.
   *
   * @param key - What the budget belongs to.
   * @param limit - How many hits the window allows.
   * @param windowMs - How long the window lasts.
   */
  hit: (key: string, limit: number, windowMs: number) => Promise<RateLimitHit>
}

/** How a limiter is built from what the application configured. */
export type RateLimiterFactory = (config: LimiterConfig) => RateLimiter

/**
 * How an application resolves what a request should be billed to.
 *
 * The escape hatch that keeps this module out of the business of guessing: an application knows
 * where its subject lives, whether that is a claim in a token, a field of a body, a header its own
 * edge signs, or a lookup a middleware of its own already did. Return nothing when the request
 * carries none, and never throw: a subject that cannot be read must degrade, not break the route.
 */
export type RateLimitSubjectResolver<EventType = any> = (event: EventType) =>
string | undefined | Promise<string | undefined>

/** The drivers shipped here. Any other string is a driver an application registered itself. */
export type RateLimitDriver = 'memory' | 'redis' | (string & {})

/** What a configured limiter declares. */
export interface LimiterConfig {
  /** The name it is resolved under. */
  name: string
  /** Which driver builds it. Defaults to `memory`, and ignored when `factory` is given. */
  driver?: RateLimitDriver
  /**
   * Build the limiter yourself, instead of naming a driver this package ships.
   *
   * This is how a deployment counts in the store it already runs on. It is declared here, next to
   * the other limiters, rather than registered on the manager from a provider: the container is
   * rebuilt for every event, so anything registered imperatively during one event is gone for the
   * next, and an application should not have to know that to plug in a driver.
   */
  factory?: RateLimiterFactory
  /** Anything the driver needs. */
  [key: string]: unknown
}

/** Options for the Redis driver. */
export interface RedisLimiterConfig extends LimiterConfig {
  /** An `ioredis` client, or the options to build one. */
  client?: unknown
  /** Key prefix, so several applications can share one Redis. Defaults to `ratelimit:`. */
  prefix?: string
}

/**
 * What a route (or a handler) declares about its budget.
 *
 * `max` per `window`, and `by` names what the budget belongs to. The default is the caller's
 * address, which is the only thing every request carries; naming a subject is almost always better,
 * for the reason spelled out in {@link RateLimitConfig}.
 */
export interface RateLimitRule {
  /** How many requests the window allows. */
  max: number
  /** How long the window lasts, in seconds. */
  window: number
  /**
   * What the budget belongs to. **Required**, and deliberately so.
   *
   * A field of the request (`'email'`), several alternatives (`'phone|email'`, first present wins),
   * `'user'` for the authenticated principal, `'address'` for the caller's address, or a function
   * resolving it from the event.
   *
   * There is no default because the only plausible one is `'address'`, and that is the single thing
   * this module exists to argue against (see {@link RateLimitConfig}). A rule that omitted the word
   * therefore meant the opposite of what the module recommends, and nothing in a review showed it.
   * Whoever wants the address writes `'address'`, and it becomes a decision on the page.
   */
  by: 'address' | 'user' | (string & {}) | RateLimitSubjectResolver
  /**
   * The per-address backstop that runs alongside a subject budget, as a multiple of `max`.
   *
   * Only used when `by` names a subject. Deliberately generous: the subject budget is the real
   * guarantee, and this one only has to stop someone enumerating subjects in bulk from one machine.
   * Set `false` to run the subject budget alone.
   */
  backstop?: number | false
  /**
   * A bucket this rule shares with every other rule naming it, instead of one bucket per route.
   *
   * Without it a rule is counted per route, which is what a route's own budget should be: two routes
   * declaring `max: 5` are two budgets of five, not one shared between them.
   *
   * That default carries a consequence worth knowing, because a rule on a group is copied onto each
   * child: `{ max: 100, window: 60 }` on a group is then *a hundred per child route*, not a hundred
   * across the group. Name a scope to make it the ceiling it looks like:
   *
   * ```ts
   * @EventHandler('/api', { rateLimit: { max: 100, window: 60, scope: 'api' } })
   * ```
   *
   * It is not only for groups: any set of routes can share one budget by naming the same scope, which
   * is how a write quota spanning several endpoints is expressed.
   */
  scope?: string
  /** Which configured limiter counts this rule. Defaults to the application's default limiter. */
  limiter?: string
}

/** What a route may declare: one rule, or several that all apply. */
export type RateLimitInput = RateLimitRule | RateLimitRule[]

/**
 * How rate limiting is configured (`stone.rateLimit.*`).
 *
 * **The rule this module exists to serve: throttle the subject, never the address alone.** Throttling
 * by address assumes one address is one person. On mobile networks using carrier-grade NAT, the norm
 * across much of the world, hundreds of unrelated subscribers share one public address. A per-address
 * quota then punishes legitimate users at random, and hardest exactly where the audience is largest.
 *
 * So the budget belongs to the thing actually being protected: the account, the mailbox, the phone
 * number. The address keeps a much looser bucket whose only job is to stop bulk enumeration from one
 * machine.
 */
export interface RateLimitConfig {
  /** The limiter used when a rule names none. Defaults to `memory`. */
  default?: string
  /** The limiters this application configures. */
  limiters?: LimiterConfig[]
  /**
   * How to resolve the authenticated principal, for a rule that says `by: 'user'`.
   *
   * Needed because this module runs **before** authentication, deliberately: refusing a caller past
   * its budget is worth nothing once the token has been verified and the account loaded. So at that
   * point nothing has resolved a principal yet, unless the application resolved one earlier, and
   * where it lives is the application's business, not this module's.
   *
   * Point it at whatever already knows:
   *
   * ```ts
   * principal: (event) => event.getUser()?.userId
   * principal: (event) => decodeToken(event.getHeader('authorization'))?.sub
   * ```
   *
   * The default reads `event.getUser?.()` and takes its `id`, `sub` or `userId`. When nothing
   * resolves, the rule falls back to the address bucket and says so in the log: correct as a
   * behaviour, unacceptable as a silence.
   */
  principal?: RateLimitSubjectResolver

  /**
   * A rule applied to every route that declares none.
   *
   * Undeclared by default: a limit nobody asked for is a limit nobody sized, and the first thing it
   * breaks is a legitimate burst.
   */
  global?: RateLimitRule
  /**
   * Headers named after the caller's remaining budget, when the response can carry them.
   *
   * Standard by default (`RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`, and
   * `Retry-After` on a refusal). Set `false` to say nothing: a public API may prefer not to publish
   * the shape of its budget.
   */
  headers?: boolean
  /**
   * Which request headers may carry the caller's real address, in order of preference.
   *
   * Empty by default, and that default matters: a forwarded header is **client-spoofable** unless a
   * proxy you trust overwrites it, so reading one by default would hand every caller an unlimited
   * supply of identities. Name the header your own edge guarantees.
   */
  trustedAddressHeaders?: string[]
}
