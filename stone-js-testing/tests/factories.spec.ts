import { makeIncomingHttpEvent, makeIncomingEvent } from '../src/factories'

describe('makeIncomingHttpEvent', () => {
  it('applies sensible defaults', () => {
    const event = makeIncomingHttpEvent()
    expect(event.url.pathname).toBe('/')
    expect(event.isMethod('GET')).toBe(true)
  })

  it('resolves a path against localhost and upper-cases the method', () => {
    const event = makeIncomingHttpEvent({ method: 'post', url: '/users?page=2' })
    expect(event.url.pathname).toBe('/users')
    expect(event.url.host).toBe('localhost')
    expect(event.isMethod('POST')).toBe(true)
  })

  it('accepts an absolute URL and a body', () => {
    const event = makeIncomingHttpEvent({ url: 'https://api.test/tasks', method: 'POST', body: { title: 'x' } })
    expect(event.url.host).toBe('api.test')
    expect(event.get('title')).toBe('x')
  })
})

describe('makeIncomingEvent', () => {
  it('builds a generic event exposing its metadata', () => {
    const event = makeIncomingEvent({ name: 'Bob' })
    expect(event.get('name')).toBe('Bob')
  })
})
