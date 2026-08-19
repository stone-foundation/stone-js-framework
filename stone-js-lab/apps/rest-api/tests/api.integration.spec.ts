import { createTestApp, makeIncomingHttpEvent } from '@stone-js/testing'

/**
 * The real application, asked real questions.
 *
 * Nothing is listed and nothing is mocked: `createTestApp()` discovers `app/**`, so the routes under
 * test are the routes the controller declares, dispatched through the same kernel the server runs.
 * The previous integration test hand-built a router with its own definitions, which could pass while
 * every real route was broken.
 */
describe('Tasks API (integration)', () => {
  it('lists the seeded tasks', async () => {
    const app = await createTestApp()

    const response = await app.send(makeIncomingHttpEvent({ method: 'GET', url: '/tasks' }))

    expect(response.statusCode).toBe(200)
    expect(response.json()).toHaveLength(1)
  })

  it('binds a regex path param and resolves one task', async () => {
    const app = await createTestApp()

    const response = await app.send(makeIncomingHttpEvent({ method: 'GET', url: '/tasks/1' }))

    expect(response.json()).toMatchObject({ id: 1 })
  })

  it('creates from a JSON body, and answers 201', async () => {
    const app = await createTestApp()

    const response = await app.send(makeIncomingHttpEvent({
      method: 'POST',
      url: '/tasks',
      body: { title: 'From HTTP' }
    }))

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({ title: 'From HTTP', done: false })
  })

  it('toggles a task through its own route', async () => {
    const app = await createTestApp()

    const response = await app.send(makeIncomingHttpEvent({ method: 'POST', url: '/tasks/1/toggle' }))

    expect(response.json()).toMatchObject({ id: 1, done: true })
  })

  it('answers 204 on delete, with no body', async () => {
    const app = await createTestApp()

    const response = await app.send(makeIncomingHttpEvent({ method: 'DELETE', url: '/tasks/1' }))

    expect(response.statusCode).toBe(204)
  })

  it('answers 404 for a route nobody declared', async () => {
    // Through the real kernel, so this exercises the router's own not-found handling.
    const app = await createTestApp()

    const response = await app.send(makeIncomingHttpEvent({ method: 'GET', url: '/nope' }))

    expect(response.statusCode).toBe(404)
  })
})
