import mime from 'mime'
import { Mock } from 'vitest'
import { HTTP_INTERNAL_SERVER_ERROR } from '@stone-js/http-core'
import { AdapterErrorContext, ILogger, IBlueprint } from '@stone-js/core'
import { AwsLambdaHttpErrorHandler } from '../src/AwsLambdaHttpErrorHandler'

const MockAcceptsType: any = vi.fn(() => 'json')

vi.mock('accepts', () => ({
  type: vi.fn(() => 'json'),
  default: () => ({ type: MockAcceptsType })
}))

vi.mock('mime', () => ({
  getType: vi.fn(() => 'application/json'),
  default: { getType: vi.fn(() => 'application/json') }
}))

vi.mock('statuses', () => ({
  // Use a literal (not the imported constant) — a hoisted vi.mock factory cannot reference
  // top-level imports.
  default: { message: { 500: 'Internal Server Error' } }
}))

describe('AwsLambdaHttpErrorHandler', () => {
  let mockLogger: ILogger
  let mockBlueprint: IBlueprint
  let handler: AwsLambdaHttpErrorHandler
  let mockContext: AdapterErrorContext<any, any, any>

  beforeEach(() => {
    mockLogger = {
      error: vi.fn()
    } as unknown as ILogger

    mockBlueprint = {
      get: () => () => mockLogger
    } as unknown as IBlueprint

    mockContext = {
      rawEvent: {
        headers: {
          'content-type': 'application/json'
        }
      } as any,
      rawResponseBuilder: {
        add: vi.fn().mockReturnThis(),
        build: vi.fn().mockReturnValue({
          respond: vi.fn().mockReturnValue('response')
        })
      }
    } as unknown as AdapterErrorContext<any, any, any>

    handler = new AwsLambdaHttpErrorHandler({ blueprint: mockBlueprint })
  })

  test('should handle an error and return a response with correct headers', async () => {
    const error = new Error('Something went wrong')

    const response = handler.handle(error, mockContext)

    expect(mockContext.rawResponseBuilder.add).toHaveBeenCalledWith(
      'headers',
      expect.any(Headers)
    )
    expect(mockContext.rawResponseBuilder.add).toHaveBeenCalledWith(
      'statusCode',
      HTTP_INTERNAL_SERVER_ERROR
    )
    expect(mockContext.rawResponseBuilder.add).toHaveBeenCalledWith(
      'statusMessage',
      'Internal Server Error'
    )
    expect(mockLogger.error).toHaveBeenCalledWith('Something went wrong', { error })
    expect(response.build().respond()).toBe('response')
  })

  test('should use the HTTP status carried on the error itself (not always 500)', async () => {
    const error = Object.assign(new Error('Not found'), { statusCode: 404 })

    handler.handle(error, mockContext)

    expect(mockContext.rawResponseBuilder.add).toHaveBeenCalledWith('statusCode', 404)
  })

  test('should fall back to a status on error.cause', async () => {
    const error = new Error('Unauthorized')
    error.cause = { statusCode: 401 }

    handler.handle(error, mockContext)

    expect(mockContext.rawResponseBuilder.add).toHaveBeenCalledWith('statusCode', 401)
  })

  test('should tolerate a missing headers object on the raw event', async () => {
    mockContext.rawEvent.headers = undefined
    const error = new Error('no headers')

    expect(() => handler.handle(error, mockContext)).not.toThrow()
  })

  test('should default to text/plain if mime.getType returns undefined', async () => {
    (mime.getType as unknown as Mock).mockReturnValueOnce(undefined)

    const error = new Error('Fallback mime type')
    error.cause = { status: HTTP_INTERNAL_SERVER_ERROR }
    mockContext.rawEvent.headers['content-type'] = undefined

    const response = handler.handle(error, mockContext)

    expect(mockContext.rawResponseBuilder.add).toHaveBeenCalledWith(
      'headers',
      expect.any(Headers)
    )
    expect(mockLogger.error).toHaveBeenCalledWith('Fallback mime type', { error })
    expect(response.build().respond()).toBe('response')
  })

  test('should handle false return from accepts.type', async () => {
    MockAcceptsType.mockReturnValueOnce(false)

    const error = new Error('Accepts returned false')

    const response = handler.handle(error, mockContext)

    expect(mockContext.rawResponseBuilder.add).toHaveBeenCalledWith(
      'headers',
      expect.any(Headers)
    )
    expect(mockLogger.error).toHaveBeenCalledWith('Accepts returned false', { error })
    expect(response.build().respond()).toBe('response')
  })
})
