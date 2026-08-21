import { BROWSER_PLATFORM } from '@stone-js/browser-adapter'
import { createTestApp } from '@stone-js/testing'
import { makeIncomingBrowserEvent } from '@stone-js/testing/browser'

/**
 * A pure SPA declares no default platform — neither the browser adapter nor the console one claims
 * it — so the test names the context it wants. That is the same sentence the framework makes about
 * deployment, said in a test: one domain, many contexts, pick one.
 *
 * The same harness as the backend: boot the app, dispatch an event, read what came back. A page is a
 * handler, so a rendered page is just a response whose body is HTML.
 */
describe('SPA rendering (integration)', () => {
  it('renders the home page, data included', async () => {
    const app = await createTestApp({ platform: BROWSER_PLATFORM })

    const response = await app.send(makeIncomingBrowserEvent({ url: '/?name=Ada' }))

    expect(response.statusCode).toBe(200)
    expect(response.html()).toContain('Hello Ada')
  })

  it('renders the page own head, so SEO is testable', async () => {
    const app = await createTestApp({ platform: BROWSER_PLATFORM })

    const response = await app.send(makeIncomingBrowserEvent({ url: '/' }))

    expect(response.html()).toContain('<title>')
  })

  it('renders another route from the same app', async () => {
    const app = await createTestApp({ platform: BROWSER_PLATFORM })

    const response = await app.send(makeIncomingBrowserEvent({ url: '/about' }))

    expect(response.statusCode).toBe(200)
  })
})
