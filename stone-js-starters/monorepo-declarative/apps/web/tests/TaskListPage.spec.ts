import { createTestApp, makeIncomingHttpEvent } from '@stone-js/testing'

/**
 * The web application, booted in memory and asked a real question.
 *
 * Nothing is mocked and nothing is listed: `createTestApp()` discovers `app/**`, and the event goes
 * through the same kernel production runs, shared domain included.
 *
 * Read this next to `apps/mobile/tests/TaskListScreen.spec.ts`. Same domain, same assertions about
 * what it resolved; what differs is only how each platform delivers the result.
 */
describe('TaskListPage', () => {
  it('renders the task list from the shared domain', async () => {
    const app = await createTestApp()

    const response = await app.send(makeIncomingHttpEvent({ method: 'GET', url: '/' }))

    expect(response.statusCode).toBe(200)
    expect(response.html()).toContain('Run the same code on a phone')
    expect(response.html()).toContain('Acme tasks')
  })

  it('toggles a task through the domain, and says how many are left', async () => {
    const app = await createTestApp()

    // Asserted through the head rather than the body: React's server renderer splits the text
    // around `{data.remaining}` into separate nodes, so the body reads `1<!-- --> left to do`.
    // `head` builds one string, which is also what a browser tab and a navigator show.
    const before = await app.send(makeIncomingHttpEvent({ method: 'GET', url: '/' }))
    expect(before.html()).toContain('<title>1 left · Acme tasks</title>')

    const after = await app.send(makeIncomingHttpEvent({ method: 'GET', url: '/?toggle=3' }))

    expect(after.statusCode).toBe(200)
    expect(after.html()).toContain('<title>0 left · Acme tasks</title>')
  })
})
