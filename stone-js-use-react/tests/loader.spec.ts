import { describe, it, expect, vi } from 'vitest'
import {
  defineServerLoader,
  runServerLoader,
  createServerLoaderContext,
  isServerLoader
} from '../src/loader'

describe('use-react server-loader re-exports', () => {
  it('exposes the server-loader API from @stone-js/use-view', () => {
    expect(typeof defineServerLoader).toBe('function')
    expect(typeof runServerLoader).toBe('function')
    expect(typeof createServerLoaderContext).toBe('function')
    expect(typeof isServerLoader).toBe('function')
  })

  it('runs a server-first loader end to end (server success)', async () => {
    const loader = defineServerLoader(async ({ token }) => ({ id: token }))
    const ctx = createServerLoaderContext({ event: {}, isServer: true, cookies: { session: 't1' }, tokenCookieName: 'session' })
    const outcome = await runServerLoader(loader, ctx)
    expect(outcome.status).toBe('server-loaded')
    expect(outcome.data).toEqual({ id: 't1' })
    expect(outcome.snapshot).toBe(true)
  })

  it('gives up on a server-only failure with no fallback', async () => {
    const loader = defineServerLoader(async () => { throw new Error('unauthorized') }, { policy: 'server-only' })
    const ctx = createServerLoaderContext({ event: {}, isServer: true })
    const outcome = await runServerLoader(loader, ctx)
    expect(outcome.status).toBe('given-up')
    expect(outcome.clientFetch).toBe(false)
  })
})
