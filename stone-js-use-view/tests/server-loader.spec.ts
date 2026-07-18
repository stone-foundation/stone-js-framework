import { describe, it, expect, vi } from 'vitest'
import {
  defineServerLoader,
  runServerLoader,
  isServerLoader,
  createServerLoaderContext,
  ServerLoaderContext
} from '../src/server-loader'

function ctx (over: Partial<ServerLoaderContext> = {}): ServerLoaderContext {
  return {
    event: {},
    isServer: true,
    isClient: false,
    cookies: {},
    fetch: vi.fn() as any,
    ...over
  }
}

describe('defineServerLoader / isServerLoader', () => {
  it('normalizes a descriptor with default server-first policy', () => {
    const d = defineServerLoader(async () => 42)
    expect(d.__serverLoader).toBe(true)
    expect(d.policy).toBe('server-first')
    expect(isServerLoader(d)).toBe(true)
    expect(isServerLoader({})).toBe(false)
    expect(isServerLoader(null)).toBe(false)
  })
})

describe('runServerLoader — server-first', () => {
  it('server success → data in snapshot, no client refetch', async () => {
    const d = defineServerLoader(async ({ token }) => ({ user: token }))
    const outcome = await runServerLoader(d, ctx({ token: 'abc' }))
    expect(outcome.status).toBe('server-loaded')
    expect(outcome.data).toEqual({ user: 'abc' })
    expect(outcome.snapshot).toBe(true)
    expect(outcome.clientFetch).toBe(false)
  })

  it('server failure with no fallback → deferred to client', async () => {
    const onError = vi.fn()
    const d = defineServerLoader(async () => { throw new Error('unauthorized') }, { onError })
    const outcome = await runServerLoader(d, ctx())
    expect(outcome.status).toBe('deferred-to-client')
    expect(outcome.snapshot).toBe(false)
    expect(outcome.clientFetch).toBe(true)
    expect(onError).toHaveBeenCalledOnce()
  })

  it('server failure with fallback → fallback value in snapshot', async () => {
    const d = defineServerLoader(async () => { throw new Error('boom') }, { fallback: { user: null } })
    const outcome = await runServerLoader(d, ctx())
    expect(outcome.status).toBe('fallback')
    expect(outcome.data).toEqual({ user: null })
    expect(outcome.snapshot).toBe(true)
    expect(outcome.clientFetch).toBe(false)
  })
})

describe('runServerLoader — server-only ("try with token, else give up")', () => {
  it('server failure with no fallback → gives up (no client refetch)', async () => {
    const d = defineServerLoader(async ({ token, fetch }) => {
      const res = await (fetch as any)('/api/me', { headers: { authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('unauthorized')
      return res.json()
    }, { policy: 'server-only' })

    const badFetch = vi.fn().mockResolvedValue({ ok: false })
    const outcome = await runServerLoader(d, ctx({ token: 'expired', fetch: badFetch as any }))

    expect(badFetch).toHaveBeenCalled()
    expect(outcome.status).toBe('given-up')
    expect(outcome.snapshot).toBe(false)
    expect(outcome.clientFetch).toBe(false)
  })

  it('server success → data loaded with the token', async () => {
    const d = defineServerLoader(async ({ token, fetch }) => {
      const res = await (fetch as any)('/api/me', { headers: { authorization: `Bearer ${token}` } })
      return res.json()
    }, { policy: 'server-only' })

    const okFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 1 }) })
    const outcome = await runServerLoader(d, ctx({ token: 'valid', fetch: okFetch as any }))

    expect(outcome.status).toBe('server-loaded')
    expect(outcome.data).toEqual({ id: 1 })
    expect(outcome.snapshot).toBe(true)
  })
})

describe('runServerLoader — client-only', () => {
  it('on the server → deferred to client, nothing runs', async () => {
    const load = vi.fn()
    const d = defineServerLoader(load, { policy: 'client-only' })
    const outcome = await runServerLoader(d, ctx({ isServer: true, isClient: false }))
    expect(load).not.toHaveBeenCalled()
    expect(outcome.status).toBe('deferred-to-client')
    expect(outcome.clientFetch).toBe(true)
  })

  it('on the client → runs the loader', async () => {
    const d = defineServerLoader(async () => 'browser-data', { policy: 'client-only' })
    const outcome = await runServerLoader(d, ctx({ isServer: false, isClient: true }))
    expect(outcome.status).toBe('server-loaded')
    expect(outcome.data).toBe('browser-data')
  })
})

describe('createServerLoaderContext', () => {
  it('resolves the token from a cookie by name', () => {
    const c = createServerLoaderContext({
      event: {},
      isServer: true,
      cookies: { session: 'tok123' },
      tokenCookieName: 'session'
    })
    expect(c.token).toBe('tok123')
    expect(c.isClient).toBe(false)
  })

  it('falls back to the bearer authorization header', () => {
    const c = createServerLoaderContext({
      event: {},
      isServer: true,
      authorization: 'Bearer headertok'
    })
    expect(c.token).toBe('headertok')
  })
})
