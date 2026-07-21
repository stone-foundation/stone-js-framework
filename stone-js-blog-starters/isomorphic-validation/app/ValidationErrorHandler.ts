import { ValidationError } from '@stone-js/validation'
import { ErrorHandler, IErrorHandler, Promiseable } from '@stone-js/core'
import { HTTP_UNPROCESSABLE_ENTITY, IncomingHttpEvent } from '@stone-js/http-core'

/**
 * ValidationErrorHandler
 *
 * Maps the platform-agnostic `ValidationError` (thrown by the `validate` middleware) into an HTTP
 * 422 with a problem+json-style `errors` payload keyed by field. The error itself knows nothing
 * about HTTP; this handler is where the HTTP context gives it a status code.
 */
@ErrorHandler({ error: ['ValidationError'] })
export class ValidationErrorHandler implements IErrorHandler<IncomingHttpEvent> {
  handle (error: ValidationError, _event: IncomingHttpEvent): Promiseable<unknown> {
    return {
      statusCode: HTTP_UNPROCESSABLE_ENTITY,
      content: {
        message: 'The given data failed validation.',
        errors: error.toIssuesRecord()
      }
    }
  }
}
