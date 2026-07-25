import { IncomingHttpEvent } from '@stone-js/http-core'
import { factoryWelcomeEventHandler, WelcomePayload } from '../app/handlers/WelcomeEventHandler'

describe('factoryWelcomeEventHandler', () => {
  const makeEvent = (name?: string): IncomingHttpEvent => ({
    get: vi.fn((_key: string, fallback: string) => name ?? fallback),
  }) as unknown as IncomingHttpEvent

  it('should return a branded Stone.js payload greeting the given name', () => {
    // Act
    const handler = factoryWelcomeEventHandler()
    const payload = handler(makeEvent('Ada')) as unknown as WelcomePayload

    // Assert
    expect(payload.message).toBe('Hello Ada! Welcome to Stone.js.')
    expect(payload.framework.name).toBe('Stone.js')
    expect(payload.framework.tagline).toBe('The continuum framework')
    expect(payload.framework.docs).toBe('https://stonejs.dev')
    expect(payload.framework.github).toBe('https://github.com/stone-foundation/stone-js-framework')
  })

  it('should fall back to the default name when none is provided', () => {
    // Act
    const handler = factoryWelcomeEventHandler()
    const payload = handler(makeEvent()) as unknown as WelcomePayload

    // Assert
    expect(payload.message).toBe('Hello Stone! Welcome to Stone.js.')
    expect(payload.framework.name).toBe('Stone.js')
  })
})
