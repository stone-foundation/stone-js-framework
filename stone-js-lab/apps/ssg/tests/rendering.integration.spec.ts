import { createTestApp } from '@stone-js/testing'
import { makeIncomingHttpEvent } from '@stone-js/testing/http'

/**
 * Static generation renders the same pages, so the same test covers them.
 *
 * The same harness as the backend: boot the app, dispatch an event, read what came back. A page is a
 * handler, so a rendered page is just a response whose body is HTML.
 */
describe('SSG rendering (integration)', () => {
  it('renders the home page, data included', async () => {
    const app = await createTestApp()

    const response = await app.send(makeIncomingHttpEvent({ method: 'GET', url: '/?name=Ada' }))

    expect(response.statusCode).toBe(200)
    expect(response.html()).toContain('Hello Ada')
  })

  it('renders the page own head, so SEO is testable', async () => {
    const app = await createTestApp()

    const response = await app.send(makeIncomingHttpEvent({ method: 'GET', url: '/' }))

    expect(response.html()).toContain('<title>')
  })

  it('renders another route from the same app', async () => {
    const app = await createTestApp()

    const response = await app.send(makeIncomingHttpEvent({ method: 'GET', url: '/about' }))

    expect(response.statusCode).toBe(200)
  })
})
