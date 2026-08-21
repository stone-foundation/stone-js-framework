import { makeIncomingBrowserEvent } from '../src/browser'

describe('makeIncomingBrowserEvent', () => {
  it('applies sensible defaults', () => {
    const event = makeIncomingBrowserEvent()

    expect(event.url.pathname).toBe('/')
    expect(event.url.host).toBe('localhost')
  })

  it('resolves a path against localhost, query string included', () => {
    const event = makeIncomingBrowserEvent({ url: '/tasks?page=2' })

    expect(event.url.pathname).toBe('/tasks')
    expect(event.get('page')).toBe('2')
  })

  it("keeps an application's own scheme, which is how a deep link arrives", () => {
    // The reason this factory exists at all: a native application is reached through its scheme,
    // and resolving that against an http origin would lose it.
    const event = makeIncomingBrowserEvent({ url: 'myapp://tasks/42' })

    expect(event.url.protocol).toBe('myapp:')
    expect(event.url.pathname).toBe('/42')
  })

  it('carries metadata, readable the way a handler reads it', () => {
    const event = makeIncomingBrowserEvent({ metadata: { name: 'Ada' } })

    expect(event.get('name')).toBe('Ada')
  })

  it('carries a fingerprint, which is what the agnostic event lacks', () => {
    // The renderer keys its hydration snapshot on this. Dispatching an event without it fails with
    // `event.fingerprint is not a function`, from inside the kernel's error handler.
    const event = makeIncomingBrowserEvent({ url: '/tasks' })

    expect(typeof event.fingerprint()).toBe('string')
    expect(event.fingerprint().length).toBeGreaterThan(0)
  })
})
