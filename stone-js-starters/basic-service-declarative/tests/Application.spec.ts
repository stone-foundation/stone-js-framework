import { createTestApp } from '@stone-js/testing'
import { makeIncomingHttpEvent } from '@stone-js/testing/http'

/**
 * The whole application, booted in memory and asked a real question.
 *
 * Nothing is mocked and nothing is listed: `createTestApp()` discovers `app/**`, and the event goes
 * through the same kernel production runs. If this passes the application works; if it fails the
 * application is broken. That is the only kind of test worth shipping in a starter — the previous one
 * stubbed out the framework's own decorators, which meant it could pass while nothing worked.
 */
describe('Application', () => {
  it('answers the caller', async () => {
    const app = await createTestApp()

    const response = await app.send(makeIncomingHttpEvent({ method: 'GET', url: '/?name=Ada' }))

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({ message: expect.stringContaining('Ada') })
  })

  it('answers when nobody says who they are', async () => {
    const app = await createTestApp()

    const response = await app.send(makeIncomingHttpEvent({ method: 'GET', url: '/' }))

    expect(response.statusCode).toBe(200)
  })
})
