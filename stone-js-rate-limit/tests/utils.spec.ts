import { hashSubject, normalizeAddress, retryAfterSeconds, scopeOf, windowOf } from '../src/utils'

describe('the address a budget is keyed on', () => {
  it('drops the port, because a port is per connection', () => {
    // The lesson this encodes: an edge header often carries `address:port`, and that port is
    // ephemeral. Leaving it in the key gives each connection its own budget, which turns the limiter
    // off, while still firing on callers well-behaved enough to reuse a keep-alive connection. A
    // limiter that only punishes good clients is worse than none, because it looks like it works.
    expect(normalizeAddress('1.2.3.4:56789')).toBe('1.2.3.4')
    expect(normalizeAddress('1.2.3.4')).toBe('1.2.3.4')
  })

  it('keeps a bracketed IPv6 address and drops its port', () => {
    expect(normalizeAddress('[2001:db8::1]:443')).toBe('2001:db8::1')
    expect(normalizeAddress('[2001:db8::1]')).toBe('2001:db8::1')
  })

  it('keys a bare IPv6 address on the /64 a subscriber holds', () => {
    // Telling a trailing port from the address's last group is genuinely ambiguous, and the /64 is
    // the right granularity for IPv6 anyway: it is what one subscriber is assigned.
    expect(normalizeAddress('2001:db8:1234:5678:9abc:def0:1234:5678')).toBe('2001:db8:1234:5678')
  })

  it('tolerates the whitespace an edge header arrives with', () => {
    expect(normalizeAddress('  1.2.3.4:9  ')).toBe('1.2.3.4')
  })
})

describe('the subject a budget belongs to', () => {
  it('normalises, so one identity cannot buy two budgets', () => {
    expect(hashSubject('A@b.com')).toBe(hashSubject('  a@b.com '))
  })

  it('never carries the subject itself, since a key gets logged and exported', () => {
    const hashed = hashSubject('someone@example.test')

    expect(hashed).not.toContain('someone')
    expect(hashed).not.toContain('example')
    expect(hashed).toMatch(/^[0-9a-f]{32}$/)
  })

  it('says nothing for an absent or empty subject', () => {
    expect(hashSubject(undefined)).toBeUndefined()
    expect(hashSubject('')).toBeUndefined()
    expect(hashSubject('   ')).toBeUndefined()
    expect(hashSubject(42)).toBeUndefined()
  })
})

describe('the window a hit falls in', () => {
  it('is deterministic, so every instance agrees on the boundary without talking', () => {
    const a = windowOf(1_000_500, 1000)
    const b = windowOf(1_000_900, 1000)

    expect(a.index).toBe(b.index)
    expect(a.resetAt).toBe(1_001_000)
  })

  it('starts a new window at the boundary', () => {
    expect(windowOf(1_001_000, 1000).index).toBe(windowOf(1_000_500, 1000).index + 1)
  })

  it('never tells a caller to retry in zero seconds', () => {
    expect(retryAfterSeconds(1000, 1000)).toBe(1)
    expect(retryAfterSeconds(500, 1000)).toBe(1)
    expect(retryAfterSeconds(4200, 1000)).toBe(4)
  })
})

describe('the scope a budget is filed under', () => {
  const route = (options: Record<string, unknown>): any => ({
    getOption: <T>(key: string): T | undefined => options[key] as T
  })

  it('uses the declared path, so rotating a code in the URL buys no new budget', () => {
    // Keying on the live pathname went too far: a path carries resource codes, and rotating one handed
    // out a fresh budget.
    const scope = scopeOf(route({ name: 'notes.show', method: 'GET', path: '/notes/:code' }), '/notes/abc')

    expect(scope).toBe('notes.show:GET /notes/:code')
  })

  it('separates two routes of the same handler, which sharing a bucket did not', () => {
    // Keying on the handler alone made every endpoint of a controller share one bucket, so a request
    // to one route silently ate another's budget, under whichever limit happened to apply.
    const list = scopeOf(route({ name: 'notes', method: 'GET', path: '/notes' }), '/notes')
    const create = scopeOf(route({ name: 'notes', method: 'POST', path: '/notes' }), '/notes')

    expect(list).not.toBe(create)
  })

  it('uses the name when a route declares no path, as a non-HTTP route does', () => {
    expect(scopeOf(route({ name: 'import.run' }), '/anything')).toBe('import.run')
  })

  it('falls back to what it was given when there is no route', () => {
    expect(scopeOf(undefined, '/anything')).toBe('/anything')
    expect(scopeOf(route({}), '/anything')).toBe('/anything')
  })
})
