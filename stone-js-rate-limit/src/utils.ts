import { createHash } from 'node:crypto'

/** How much slack the per-address backstop gets, relative to the subject's limit. */
export const IP_BACKSTOP_FACTOR = 10

/** Seconds a refused caller should wait, never below one. */
export function retryAfterSeconds (resetAt: number, now: number = Date.now()): number {
  return Math.max(1, Math.ceil((resetAt - now) / 1000))
}

/**
 * The window a timestamp falls in, and when that window ends.
 *
 * The index becomes part of the key, so a new window is a new entry that starts at zero: no cleanup
 * job, no read-modify-write, and an entry that ages out on its own. It also makes every instance of a
 * distributed application agree on where the boundary is, without talking to each other.
 *
 * @param now - The timestamp.
 * @param windowMs - How long a window lasts.
 * @returns The window's index and its end.
 */
export function windowOf (now: number, windowMs: number): { index: number, resetAt: number } {
  const index = Math.floor(now / windowMs)

  return { index, resetAt: (index + 1) * windowMs }
}

/**
 * Strip the port from an address, and reduce an IPv6 address to the block a subscriber holds.
 *
 * An edge header often carries `address:port`, and that port is **ephemeral**: the client's operating
 * system picks a new one for every connection. Leaving it in the key gives each *connection* its own
 * budget, which quietly turns the limiter off, while still firing on the callers well-behaved enough
 * to reuse a keep-alive connection. A limiter that only punishes good clients is worse than none,
 * because it looks like it works.
 *
 * For a bare IPv6 address, telling a trailing port from the address's last group is genuinely
 * ambiguous, so the key is the `/64` prefix: the block a single subscriber is normally assigned, which
 * sidesteps the ambiguity and is the right granularity for IPv6 anyway.
 *
 * @param address - The raw address, as the edge reported it.
 * @returns The address to key on.
 */
export function normalizeAddress (address: string): string {
  const value = address.trim()

  const bracketed = /^\[(.+)\](?::\d+)?$/.exec(value)
  if (bracketed !== null) { return bracketed[1] }

  const colons = value.split(':').length - 1

  if (colons === 1) { return value.split(':')[0] }
  if (colons > 1) { return value.split(':').slice(0, 4).join(':') }

  return value
}

/**
 * Normalise then hash a subject, so `A@b.com` and `a@b.com ` cannot buy two budgets.
 *
 * Hashed because a key is a thing that gets logged, exported and read by whoever debugs the store: an
 * address, a phone number or an account id has no business being there. Truncated to 32 hex
 * characters, which is far past collision territory for a rate-limit bucket.
 *
 * @param raw - The subject, as the request carried it.
 * @returns The hashed subject, or nothing when it is absent or empty.
 */
export function hashSubject (raw: unknown): string | undefined {
  if (typeof raw !== 'string') { return undefined }

  const normalized = raw.trim().toLowerCase()
  if (normalized === '') { return undefined }

  return createHash('sha256').update(normalized).digest('hex').slice(0, 32)
}

/** The shape this module reads from a route, duck-typed so it never imports the router. */
export interface RouteLike {
  getOption: <T = unknown>(key: string, fallback?: T) => T | undefined
}

/**
 * What a budget belongs to, route-wise: one bucket per route, named by its **declared** path.
 *
 * Both halves are load-bearing, and both were learnt from a limiter that got them wrong. Keying on
 * the handler alone made every endpoint of a controller share one bucket, so a request to one route
 * silently ate another's budget, under whichever limit happened to apply. Keying on the live pathname
 * goes too far the other way: a path carries resource codes, so rotating a code in the URL hands out
 * a brand-new budget.
 *
 * @param route - The matched route, when there is one.
 * @param fallback - What to use when there is no route, normally the event's pathname.
 * @returns The scope.
 */
export function scopeOf (route: RouteLike | undefined, fallback: string): string {
  const name = route?.getOption<string>('name') ?? ''
  const method = route?.getOption<string>('method') ?? 'ANY'
  const declaredPath = route?.getOption<string>('path') ?? ''

  if (declaredPath !== '') { return `${name}:${method} ${declaredPath}` }

  return name !== '' ? name : fallback
}
