import { httpCoreBlueprint, jsonHttpResponse } from '@stone-js/http-core'
import { createTestApp } from '../src/createTestApp'
import { makeIncomingHttpEvent } from '../src/factories'

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

  it('propagates errors when the app has no error handler (nothing is swallowed)', async () => {
    const app = await createTestApp({
      blueprint: { stone: { kernel: { eventHandler: () => { throw new Error('boom') } } } } as any
    })
    await expect(app.send(makeIncomingHttpEvent({ url: '/boom' }))).rejects.toThrow()
  })
})
