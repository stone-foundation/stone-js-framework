import { htmlHttpResponse, httpCoreBlueprint, jsonHttpResponse } from '@stone-js/http-core'
import { createTestApp } from '../src/createTestApp'
import { makeIncomingHttpEvent } from '../src/http'

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

  it('lets a test force a value over what the application declares', async () => {
    // The one ordering a test can use. `@StoneApp` carries the default blueprint, which sets nearly
    // every key, so an option merged before the application's modules would do nothing at all.
    class NameHandler {
      private readonly blueprint: any
      constructor ({ blueprint }: any) { this.blueprint = blueprint }
      handle (): any { return jsonHttpResponse({ name: this.blueprint.get('stone.name') }, 200) }
    }

    const app = await createTestApp({
      modules: [{ stone: { name: 'FromTheApp', kernel: { eventHandler: { module: NameHandler, isClass: true } } } }] as any,
      blueprint: { stone: { name: 'ForcedByTheTest' } } as any
    })

    const response: any = await app.send(makeIncomingHttpEvent({ method: 'GET', url: '/' }))

    expect(JSON.parse(response.content).name).toBe('ForcedByTheTest')
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

describe('createTestApp with a named context', () => {
  it('boots the app as the platform the test asked for', async () => {
    // An app that is both an HTTP service and a CLI is two contexts over one domain; a test picks one.
    const app = await createTestApp({
      platform: 'node-http',
      modules: [{ stone: { kernel: { eventHandler: () => jsonHttpResponse({ ok: true }, 200) } } }] as any
    })

    const response = await app.send(makeIncomingHttpEvent({ url: '/' }))

    expect(response.json()).toEqual({ ok: true })
  })
})

describe('a test application is a new process', () => {
  it('starts with nothing held per process, so one test cannot seed the next', async () => {
    // Modules keep what has to outlive an event outside the container: a cache's stores, a limiter's
    // counters. Carried from one test application into the next, that state would make a suite pass
    // or fail on the order its files happened to run in, which is the least debuggable kind of test.
    const { perProcess } = await import('@stone-js/core')

    class CounterHandler {
      handle (): any {
        const held = perProcess('counter', () => ({ hits: 0 }))
        held.hits++
        return jsonHttpResponse({ hits: held.hits }, 200)
      }
    }

    const boot = async (): Promise<any> => await createTestApp({
      modules: [{ stone: { kernel: { eventHandler: { module: CounterHandler, isClass: true } } } }] as any
    })

    const first = await boot()
    await first.send(makeIncomingHttpEvent({ method: 'GET', url: '/x' }))
    const again: any = await first.send(makeIncomingHttpEvent({ method: 'GET', url: '/x' }))

    // Within one application it is kept, which is the whole point of holding it there.
    expect(JSON.parse(again.content)).toEqual({ hits: 2 })

    const second = await boot()
    const fresh: any = await second.send(makeIncomingHttpEvent({ method: 'GET', url: '/x' }))

    expect(JSON.parse(fresh.content)).toEqual({ hits: 1 })
  })
})
