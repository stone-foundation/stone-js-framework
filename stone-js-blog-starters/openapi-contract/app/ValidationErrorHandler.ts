import { ValidationError } from '@stone-js/validation'
import { ErrorHandler, IErrorHandler, Promiseable } from '@stone-js/core'
import { HTTP_UNPROCESSABLE_ENTITY, IncomingHttpEvent } from '@stone-js/http-core'

/**
 * ValidationErrorHandler
 *
 * Maps a failed schema (the 422 the contract advertises) to an HTTP 422 with field-keyed issues.
 */
@ErrorHandler({ error: ['ValidationError'] })
export class ValidationErrorHandler implements IErrorHandler<IncomingHttpEvent> {
  handle (error: ValidationError, _event: IncomingHttpEvent): Promiseable<unknown> {
    return {
      statusCode: HTTP_UNPROCESSABLE_ENTITY,
      content: { message: 'The given data failed validation.', errors: error.toIssuesRecord() }
    }
  }
}
