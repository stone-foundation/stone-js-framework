import { jsonHttpResponse } from '@stone-js/http-core'
import { buildFetchHandler } from '../src/buildFetchHandler'
import { serveFetch, serveCloudflare, serveVercel, serveNetlify, serveBun, serveDeno } from '../src/serve'

const app = (): any => ({
  blueprint: { stone: { kernel: { eventHandler: () => jsonHttpResponse({ ok: true }, 200) } } }
})

describe('buildFetchHandler', () => {
  it('boots the app with the Fetch adapter and returns a Web fetch handler', async () => {
    const handler = await buildFetchHandler(app())
    const response = await handler(new Request('http://localhost/'))
    expect(response).toBeInstanceOf(Response)
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
  })

  it('accepts modules instead of a blueprint', async () => {
    const handler = await buildFetchHandler({
      modules: [{ stone: { kernel: { eventHandler: () => jsonHttpResponse({ via: 'modules' }, 200) } } }]
    })
    const response = await handler(new Request('http://localhost/'))
    expect(await response.json()).toEqual({ via: 'modules' })
  })
})

describe('serveFetch', () => {
  it('lazily boots once and serves requests', async () => {
    const handler = serveFetch(app())
    const a = await handler(new Request('http://localhost/a'))
    const b = await handler(new Request('http://localhost/b'))
    expect(a.status).toBe(200)
    expect(b.status).toBe(200)
  })
})

describe('platform helpers', () => {
  it('serveCloudflare exposes a fetch(request, env, ctx) method', async () => {
    const worker = serveCloudflare(app())
    const response = await worker.fetch(new Request('http://localhost/'), { KV: 1 }, { waitUntil () {} })
    expect(response.status).toBe(200)
  })

  it('serveVercel returns a plain fetch handler', async () => {
    const response = await serveVercel(app())(new Request('http://localhost/'))
    expect(response.status).toBe(200)
  })

  it('serveNetlify forwards the context', async () => {
    const response = await serveNetlify(app())(new Request('http://localhost/'), { geo: 'x' })
    expect(response.status).toBe(200)
  })

  it('serveBun returns a Bun.serve-compatible object with extra options', async () => {
    const server = serveBun(app(), { port: 4321 })
    expect(server.port).toBe(4321)
    const response = await (server.fetch as any)(new Request('http://localhost/'))
    expect(response.status).toBe(200)
  })
})

describe('serveDeno', () => {
  afterEach(() => { delete (globalThis as any).Deno })

  it('throws when not running on Deno', () => {
    expect(() => serveDeno(app())).toThrow('Deno')
  })

  it('starts Deno.serve when available', async () => {
    const serve = vi.fn((_opts: unknown, handler: any) => ({ handler }))
    ;(globalThis as any).Deno = { serve }
    const server: any = serveDeno(app(), { port: 8000 })
    expect(serve).toHaveBeenCalledWith({ port: 8000 }, expect.any(Function))
    // the passed handler serves requests
    const response = await server.handler(new Request('http://localhost/'))
    expect(response.status).toBe(200)
  })
})
