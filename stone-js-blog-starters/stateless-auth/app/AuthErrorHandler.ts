import { AuthenticationError, AuthorizationError } from '@stone-js/auth'
import { ErrorHandler, IErrorHandler, Promiseable } from '@stone-js/core'
import { HTTP_FORBIDDEN, HTTP_UNAUTHORIZED, IncomingHttpEvent } from '@stone-js/http-core'

/**
 * AuthErrorHandler
 *
 * Gives the platform-agnostic auth errors their HTTP meaning: a missing/invalid token is a 401,
 * a missing scope is a 403. The errors themselves know nothing about HTTP; this is where the
 * boundary maps them.
 */
@ErrorHandler({ error: ['AuthenticationError', 'AuthorizationError'] })
export class AuthErrorHandler implements IErrorHandler<IncomingHttpEvent> {
  handle (error: AuthenticationError | AuthorizationError, _event: IncomingHttpEvent): Promiseable<unknown> {
    const statusCode = error instanceof AuthorizationError ? HTTP_FORBIDDEN : HTTP_UNAUTHORIZED
    return {
      statusCode,
      content: { message: error.message }
    }
  }
}
