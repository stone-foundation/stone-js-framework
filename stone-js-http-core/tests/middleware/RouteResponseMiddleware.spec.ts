import { URL } from 'node:url'
import { HttpMethods } from '../../src/declarations'
import { IncomingHttpEvent } from '../../src/IncomingHttpEvent'
import { jsonHttpResponse } from '../../src/HttpResponse'
import { MetaRouteResponseMiddleware, RouteResponseMiddleware } from '../../src/middleware/RouteResponseMiddleware'

/** A real event, with a route that declares what it answers with. */
const eventDeclaring = (response?: unknown): any => {
  const event: any = IncomingHttpEvent.create({
    url: new URL('http://localhost/tasks'),
    method: HttpMethods.GET,
    headers: {}
  } as any)
  event.getRoute = () => ({
    getOption: (key: string) => (key === 'response' ? response : undefined)
  })
  return event
}

const middleware = (): RouteResponseMiddleware => new RouteResponseMiddleware()

describe('a route that says what it answers with', () => {
  it('builds the declared response around what the handler returned', async () => {
    // The point of the option: the handler stays about the domain, and the endpoint is described in
    // one place, next to its path and its method.
    const response: any = await middleware().handle(
      eventDeclaring({ type: 'json', status: 200 }),
      (async () => ({ id: 1 })) as any
    )

    expect(response.statusCode).toBe(200)
    expect(response.content).toEqual({ id: 1 })
  })

  it('honours the status it declared, which is the reason to declare one', async () => {
    const response: any = await middleware().handle(
      eventDeclaring({ type: 'json', status: 201 }),
      (async () => ({ id: 1 })) as any
    )

    expect(response.statusCode).toBe(201)
  })

  it('defaults to JSON and 200, so `{ status: 201 }` alone is enough', async () => {
    const response: any = await middleware().handle(eventDeclaring({}), (async () => ({ ok: true })) as any)

    expect(response.statusCode).toBe(200)
    expect(response.content).toEqual({ ok: true })
  })

  it('answers 204 with nothing in it', async () => {
    const response: any = await middleware().handle(
      eventDeclaring({ type: 'no-content' }),
      (async () => ({ ignored: true })) as any
    )

    expect(response.statusCode).toBe(204)
  })

  it('sends HTML as HTML', async () => {
    const response: any = await middleware().handle(
      eventDeclaring({ type: 'html' }),
      (async () => '<h1>Hi</h1>') as any
    )

    expect(response.content).toBe('<h1>Hi</h1>')
  })

  it('points a redirect at what the handler returned', async () => {
    const response: any = await middleware().handle(
      eventDeclaring({ type: 'redirect' }),
      (async () => '/tasks/1') as any
    )

    expect(response.statusCode).toBe(302)
    expect(response.headers.get?.('Location') ?? response.headers.Location).toBe('/tasks/1')
  })

  it('adds the headers it declared', async () => {
    const response: any = await middleware().handle(
      eventDeclaring({ type: 'json', headers: { 'X-Total-Count': '12' } }),
      (async () => []) as any
    )

    expect(response.headers.get?.('X-Total-Count') ?? response.headers['X-Total-Count']).toBe('12')
  })
})

describe('what it deliberately does not touch', () => {
  it('steps aside when the handler already answered with a response', async () => {
    // `@JsonHttpResponse(201)` produces the response itself, and the more specific statement wins:
    // the two forms are a choice, not a conflict.
    const response: any = await middleware().handle(
      eventDeclaring({ type: 'json', status: 200 }),
      (async () => jsonHttpResponse({ id: 1 }, 201)) as any
    )

    expect(response.statusCode).toBe(201)
  })

  it('passes everything through when the route declares nothing', async () => {
    const payload = { id: 1 }

    await expect(middleware().handle(eventDeclaring(undefined), (async () => payload) as any))
      .resolves.toBe(payload)
  })

  it('passes through when there is no route at all', async () => {
    const event: any = IncomingHttpEvent.create({
      url: new URL('http://localhost/tasks'), method: HttpMethods.GET, headers: {}
    } as any)

    await expect(middleware().handle(event, (async () => 'raw') as any)).resolves.toBe('raw')
  })

  it('runs outside every other route middleware, because it produces the final answer', () => {
    // Lower priority runs further out: the payload has been shaped by a resource and cleared by a
    // guard before this builds the response around it.
    expect(MetaRouteResponseMiddleware).toEqual(
      expect.objectContaining({ module: RouteResponseMiddleware, isClass: true, priority: 2 })
    )
  })
})
