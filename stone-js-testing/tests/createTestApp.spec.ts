import { htmlHttpResponse, httpCoreBlueprint, jsonHttpResponse } from '@stone-js/http-core'
import { createTestApp } from '../src/createTestApp'
import { makeIncomingHttpEvent } from '../src/factories'

/** The shape real code has: a class whose dependencies are auto-wired from the container. */
class ClockHandler {
  private readonly clock: { now: () => string }

  constructor ({ clock }: any) { this.clock = clock }

  handle (): any { return jsonHttpResponse({ at: this.clock.now() }, 200) }
}

describe('createTestApp', () => {
  it('boots an app in-memory and dispatches through the kernel', async () => {
    const app = await createTestApp({
      blueprint: {
        stone: {
          name: 'TestApp',
          kernel: {
            eventHandler: (event: any) => jsonHttpResponse({ hello: event.get('name', 'World') }, 201)
          }
        }
      } as any
    })

    const response: any = await app.send(makeIncomingHttpEvent({ method: 'GET', url: '/ping' }))

    expect(response.statusCode).toBe(201)
    expect(JSON.parse(response.content)).toEqual({ hello: 'World' })
  })

  it('accepts modules (not just a blueprint) and reuses the app across sends', async () => {
    const app = await createTestApp({
      modules: [{ stone: { kernel: { eventHandler: () => jsonHttpResponse({ ok: true }, 200) } } }] as any
    })

    const a: any = await app.send(makeIncomingHttpEvent({ url: '/a' }))
    const b: any = await app.send(makeIncomingHttpEvent({ url: '/b' }))

    expect(a.statusCode).toBe(200)
    expect(b.statusCode).toBe(200)
  })

  it('routes handler errors through the kernel error handler (graceful 500)', async () => {
    const app = await createTestApp({
      modules: [httpCoreBlueprint],
      blueprint: {
        stone: { kernel: { eventHandler: () => { throw new Error('boom') } } }
      } as any
    })

    const response: any = await app.send(makeIncomingHttpEvent({ url: '/boom' }))
    expect(response.statusCode).toBeGreaterThanOrEqual(500)
  })

  it('discovers the app modules when none are listed', async () => {
    // The gap that weighed most: a hand-written list drifts, and a forgotten handler answers 404 in
    // a way that reads as a routing bug rather than a missing module.
    const app = await createTestApp({ pattern: 'tests/fixtures/app/**/*.js', envFile: false })

    const response = await app.send(makeIncomingHttpEvent({ url: '/' }))

    // The handler came from the fixture file, which nothing named.
    expect(response.json()).toEqual({ discovered: true })
  })

  it('substitutes a container binding, resolved by the code under test as the real one', async () => {
    const app = await createTestApp({
      bindings: { clock: { now: () => '2026-01-01T00:00:00.000Z' } },
      modules: [{
        stone: {
          kernel: {
            // A class handler, because the function form never receives the container: this is the
            // shape real code has, and the shape that resolves a substituted binding.
            eventHandler: { module: ClockHandler, isClass: true }
          }
        }
      }] as any
    })

    const response = await app.send(makeIncomingHttpEvent({ url: '/now' }))

    expect(response.json()).toEqual({ at: '2026-01-01T00:00:00.000Z' })
  })

  it('reads the body as data with json(), on the response the handlers produced', async () => {
    const app = await createTestApp({
      modules: [{ stone: { kernel: { eventHandler: () => jsonHttpResponse({ ok: true }, 200) } } }] as any
    })

    const response = await app.send(makeIncomingHttpEvent({ url: '/ok' }))

    expect(response.json()).toEqual({ ok: true })
    // `json()` is an addition, not a wrapper: everything else about the response is unchanged.
    expect(response.statusCode).toBe(200)
    expect(Object.keys(response)).not.toContain('json')
  })

  it('propagates errors when the app has no error handler (nothing is swallowed)', async () => {
    const app = await createTestApp({
      blueprint: { stone: { kernel: { eventHandler: () => { throw new Error('boom') } } } } as any
    })
    await expect(app.send(makeIncomingHttpEvent({ url: '/boom' }))).rejects.toThrow()
  })
})

describe('createTestApp, for a frontend app', () => {
  it('reads a rendered page as text, so a page is asserted like any other response', async () => {
    // A frontend app answers with an HTML string. There is no assertion library here on purpose:
    // query that HTML with whatever the project already uses.
    const app = await createTestApp({
      modules: [{
        stone: {
          kernel: {
            eventHandler: () => htmlHttpResponse('<!doctype html><h1>Tasks</h1>', 200)
          }
        }
      }] as any
    })

    const response = await app.send(makeIncomingHttpEvent({ url: '/' }))

    expect(response.html()).toContain('<h1>Tasks</h1>')
    expect(response.text()).toBe(response.html())
  })
})
