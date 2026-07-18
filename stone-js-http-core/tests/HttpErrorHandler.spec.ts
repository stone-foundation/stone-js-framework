import { HttpError } from '../src/errors/HttpError'
import { HttpErrorHandler } from '../src/HttpErrorHandler'
import { ILogger, IntegrationError } from '@stone-js/core'
import { NotFoundError } from '../src/errors/NotFoundError'
import { ForbiddenError } from '../src/errors/ForbiddenError'
import { BadRequestError } from '../src/errors/BadRequestError'
import { UnauthorizedError } from '../src/errors/UnauthorizedError'
import { MethodNotAllowedError } from '../src/errors/MethodNotAllowedError'

vi.mock('../src/HttpResponse', () => ({
  notFoundHttpResponse: vi.fn().mockReturnValue({ status: 404, body: 'Not Found' }),
  forbiddenHttpResponse: vi.fn().mockReturnValue({ status: 403, body: 'Forbidden' }),
  badRequestHttpResponse: vi.fn().mockReturnValue({ status: 400, body: 'Bad Request' }),
  unauthorizedHttpResponse: vi.fn().mockReturnValue({ status: 401, body: 'Unauthorized' }),
  serverErrorHttpResponse: vi.fn().mockReturnValue({ status: 500, body: 'Internal Server Error' }),
  createHttpResponse: vi.fn((body, statusCode, headers) => ({ body, status: statusCode, headers })),
  methodNotAllowedHttpResponse: vi.fn().mockReturnValue({ status: 405, body: 'Method Not Allowed' })
}))

describe('HttpErrorHandler', () => {
  const event: any = {
    tempType: 'html',
    preferredType: (_types: string[], defaultType: string) => {
      return event.tempType ?? defaultType
    }
  }
  let mockLogger: ILogger
  let handler: HttpErrorHandler

  beforeEach(() => {
    mockLogger = {
      error: vi.fn()
    } as unknown as ILogger

    handler = new HttpErrorHandler({ logger: mockLogger })
  })

  test('should throw an IntegrationError if logger is not provided', () => {
    expect(() => new HttpErrorHandler({ logger: undefined as any })).toThrowError(IntegrationError)
  })

  test('should log an error and return OutgoingHttpResponse for NotFoundError', () => {
    const error = new NotFoundError('Resource not found')

    const response = handler.handle(error, event)

    expect(mockLogger.error).toHaveBeenCalledWith('Resource not found', { error })
    expect(response).toEqual({ status: 404, body: 'Not Found' })
  })

  test('should log an error and return OutgoingHttpResponse for ForbiddenError', () => {
    const error = new ForbiddenError('Access forbidden')

    const response = handler.handle(error, event)

    expect(mockLogger.error).toHaveBeenCalledWith('Access forbidden', { error })
    expect(response).toEqual({ status: 403, body: 'Forbidden' })
  })

  test('should log an error and return OutgoingHttpResponse for UnauthorizedError', () => {
    const error = new UnauthorizedError('Unauthorized access')

    const response = handler.handle(error, event)

    expect(mockLogger.error).toHaveBeenCalledWith('Unauthorized access', { error })
    expect(response).toEqual({ status: 401, body: 'Unauthorized' })
  })

  test('should log an error and return OutgoingHttpResponse for MethodNotAllowedError', () => {
    const error = new MethodNotAllowedError('Method not allowed')

    const response = handler.handle(error, event)

    expect(mockLogger.error).toHaveBeenCalledWith('Method not allowed', { error })
    expect(response).toEqual({ status: 405, body: 'Method Not Allowed' })
  })

  test('should log an error and return OutgoingHttpResponse for BadRequestError', () => {
    const error = new BadRequestError('Bad Request')

    const response = handler.handle(error, event)

    expect(mockLogger.error).toHaveBeenCalledWith('Bad Request', { error })
    expect(response).toEqual({ status: 400, body: 'Bad Request' })
  })

  test('should log an error and return an OutgoingHttpResponse', () => {
    event.tempType = 'json'
    const error = new HttpError('Custom error', 503, { 'Content-Type': 'application/json' })

    const response = handler.handle(error, event)

    expect(mockLogger.error).toHaveBeenCalledWith('Custom error', { error })
    expect(response).toEqual({
      body: { error: 'Service Unavailable' },
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  })

  test('should log an error and return an OutgoingHttpResponse with bad values', () => {
    const error = new HttpError('Custom error', 700)

    const response = handler.handle(error, event)

    expect(mockLogger.error).toHaveBeenCalledWith('Custom error', { error })
    expect(response).toEqual({
      body: { error: 'Unknown Status' },
      status: 700,
      headers: new Headers()
    })
  })

  test('should log an error and return OutgoingHttpResponse for unknown error types', () => {
    const error = new Error('Unknown error')

    const response = handler.handle(error, event)

    expect(mockLogger.error).toHaveBeenCalledWith('Unknown error', { error })
    expect(response).toEqual({ status: 500, body: 'Internal Server Error' })
  })
})
