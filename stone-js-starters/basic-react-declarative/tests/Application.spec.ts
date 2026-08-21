import { createTestApp } from '@stone-js/testing'
import { makeIncomingBrowserEvent } from '@stone-js/testing/browser'

/**
 * The whole application, booted in memory and asked a real question.
 *
 * Nothing is mocked and nothing is listed: `createTestApp()` discovers `app/**`, and the event goes
 * through the same kernel production runs. If this passes the application works; if it fails the
 * application is broken. That is the only kind of test worth shipping in a starter — the previous one
 * stubbed out the framework's own decorators, which meant it could pass while nothing worked.
 */
describe('Pages', () => {
  it('renders the home page, data included', async () => {
    const app = await createTestApp()

    const response = await app.send(makeIncomingBrowserEvent({ url: '/?name=Ada' }))

    expect(response.statusCode).toBe(200)
    // A page is a handler, so a rendered page is a response whose body is HTML. Query that HTML with
    // whatever you already use (happy-dom, jsdom, Testing Library): none is bundled here.
    expect(response.html()).toContain('Ada')
  })

  it('renders without a name', async () => {
    const app = await createTestApp()

    const response = await app.send(makeIncomingBrowserEvent({ url: '/' }))

    expect(response.statusCode).toBe(200)
  })
})
