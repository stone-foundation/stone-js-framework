import { WelcomeEventHandler } from '../app/handlers/WelcomeEventHandler'
import { IncomingHttpEvent } from '@stone-js/http-core'

// Neutralize the routing/http decorators to lighten the test environment,
// while asserting the real branded payload the handler returns.
vi.mock(import('@stone-js/router'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    EventHandler: vi.fn(() => vi.fn()),
    Get: vi.fn(() => vi.fn()),
  }
})

vi.mock(import('@stone-js/http-core'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    JsonHttpResponse: vi.fn(() => vi.fn()),
  }
})

describe('WelcomeEventHandler', () => {
  let handler: WelcomeEventHandler

  beforeEach(() => {
    handler = new WelcomeEventHandler()
  })

  const makeEvent = (name?: string): IncomingHttpEvent => ({
    get: vi.fn((_key: string, fallback: string) => name ?? fallback),
  }) as unknown as IncomingHttpEvent

  it('should return a branded Stone.js payload greeting the given name', () => {
    // Act
    const payload = handler.welcome(makeEvent('Ada'))

    // Assert
    expect(payload.message).toBe('Hello Ada! Welcome to Stone.js.')
    expect(payload.framework.name).toBe('Stone.js')
    expect(payload.framework.tagline).toBe('The continuum framework')
    expect(payload.framework.docs).toBe('https://stonejs.dev')
    expect(payload.framework.github).toBe('https://github.com/stone-foundation/stone-js-framework')
  })

  it('should fall back to the default name when none is provided', () => {
    // Act
    const payload = handler.welcome(makeEvent())

    // Assert
    expect(payload.message).toBe('Hello Stone! Welcome to Stone.js.')
    expect(payload.framework.name).toBe('Stone.js')
  })
})
