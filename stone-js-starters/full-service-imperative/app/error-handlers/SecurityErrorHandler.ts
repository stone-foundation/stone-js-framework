import { BadCredentialsError } from '../errors/CredentialsError'
import { defineErrorHandler, FunctionalErrorHandler, ILogger, Promiseable } from '@stone-js/core'
import { BadRequestError, HTTP_BAD_REQUEST, HTTP_INTERNAL_SERVER_ERROR, HTTP_NOT_FOUND, HTTP_UNAUTHORIZED, IncomingHttpEvent, NotFoundError, UnauthorizedError } from '@stone-js/http-core'

/**
 * User Error Handler Options
 */
export interface SecurityErrorHandlerOptions {
  logger: ILogger
}

/**
 * Factory User Error Handler
 */
export function factorySecurityErrorHandler ({ logger }: SecurityErrorHandlerOptions): FunctionalErrorHandler<IncomingHttpEvent> {
  /**
   * Handle CredentialsError and UnauthorizedError
   *
   * @param error - The error to handle
   * @param _event - The incoming event
   * @returns The response
   */
  return function (error: BadCredentialsError | UnauthorizedError | NotFoundError | BadRequestError, _event: IncomingHttpEvent): Promiseable<unknown> {
    logger.error(error.message)

    let message: string = 'An error occurred'
    let statusCode: number = HTTP_INTERNAL_SERVER_ERROR

    if (error instanceof NotFoundError) {
      message = error.message
      statusCode = HTTP_NOT_FOUND
    } else if (error instanceof BadCredentialsError) {
      message = 'Invalid credentials'
      statusCode = HTTP_UNAUTHORIZED
    } else if (error instanceof UnauthorizedError) {
      statusCode = HTTP_UNAUTHORIZED
      message = 'You are not authorized to perform this action'
    } else if (error instanceof BadRequestError) {
      statusCode = HTTP_BAD_REQUEST
      message = error.message
    }

    return {
      statusCode,
      content: {
        errors: { message }
      }
    }
  }
}

/**
 * User Error Handler
 */
export const SecurityErrorHandler = defineErrorHandler(
  factorySecurityErrorHandler,
  { isFactory: true, error: ['BadCredentialsError', 'UnauthorizedError', 'NotFoundError', 'BadRequestError'] }
)
