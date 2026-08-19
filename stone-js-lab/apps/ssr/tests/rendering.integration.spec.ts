import { createTestApp, makeIncomingHttpEvent } from '@stone-js/testing'


/**
 * The frontend half of the same harness.
 *
 * A page is a handler like any other: the app is booted in memory, an event is dispatched through the
 * real kernel, and what comes back is the rendered HTML. No browser, no server, no snapshot of an
 * implementation detail — the page's actual output, including the data its service produced.
 *
 * Nothing here queries the DOM on purpose. When a test needs to interrogate structure rather than
 * match content, parse this HTML with happy-dom, jsdom or Testing Library: the framework does not
 * ship an assertion library it would then have to maintain.
 */
describe('SSR rendering (integration)', () => {
  it('renders the home page, data included', async () => {
    const app = await createTestApp()

    const response = await app.send(makeIncomingHttpEvent({ method: 'GET', url: '/?name=Ada' }))

    expect(response.statusCode).toBe(200)
    expect(response.html()).toContain('Hello Ada')
    expect(response.html()).toContain('Welcome to the Stone.js frontend lab')
  })

  it('renders the page\'s own head, so SEO is testable', async () => {
    const app = await createTestApp()

    const response = await app.send(makeIncomingHttpEvent({ method: 'GET', url: '/' }))

    expect(response.html()).toContain('<title>Home — Stone.js Lab</title>')
  })

  it('renders another route from the same app', async () => {
    const app = await createTestApp()

    const response = await app.send(makeIncomingHttpEvent({ method: 'GET', url: '/about' }))

    expect(response.statusCode).toBe(200)
  })

  it('answers 404 for a page nobody declared', async () => {
    const app = await createTestApp()

    const response = await app.send(makeIncomingHttpEvent({ method: 'GET', url: '/nope' }))

    expect(response.statusCode).toBe(404)
  })
})
