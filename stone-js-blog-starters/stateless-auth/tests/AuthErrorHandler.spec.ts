import { AuthErrorHandler } from '../app/AuthErrorHandler'
import { AuthenticationError, AuthorizationError } from '@stone-js/auth'
import { IncomingHttpEvent } from '@stone-js/http-core'

vi.mock(import('@stone-js/core'), async (importOriginal) => ({ ...(await importOriginal()), ErrorHandler: vi.fn(() => vi.fn()) }))

describe('AuthErrorHandler', () => {
  const event = {} as unknown as IncomingHttpEvent

  it('maps an authentication failure to 401', () => {
    const result = new AuthErrorHandler().handle(new AuthenticationError('Authentication required.'), event)
    expect(result).toEqual({ statusCode: 401, content: { message: 'Authentication required.' } })
  })

  it('maps a missing scope to 403', () => {
    const result = new AuthErrorHandler().handle(new AuthorizationError('Missing required scope(s): tasks:write.'), event)
    expect(result).toEqual({ statusCode: 403, content: { message: 'Missing required scope(s): tasks:write.' } })
  })
})
