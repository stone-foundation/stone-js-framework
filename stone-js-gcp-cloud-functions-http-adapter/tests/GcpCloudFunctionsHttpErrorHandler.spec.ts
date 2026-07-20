import mime from 'mime'
import { Mock } from 'vitest'
import { HTTP_INTERNAL_SERVER_ERROR } from '@stone-js/http-core'
import { GcpCloudFunctionsHttpErrorHandler } from '../src/GcpCloudFunctionsHttpErrorHandler'
import { AdapterErrorContext, ILogger, IBlueprint } from '@stone-js/core'

const MockAcceptsType: any = vi.fn(() => 'json')

vi.mock('node:process')

vi.mock('accepts', () => ({
  type: vi.fn(() => 'json'),
  default: () => ({ type: MockAcceptsType })
}))

vi.mock('mime', () => ({
  getType: vi.fn(() => 'application/json'),
  default: { getType: vi.fn(() => 'application/json') }
}))

vi.mock('statuses', () => ({
  // Literal (not the imported constant): a hoisted vi.mock factory cannot reference imports.
  default: { message: { 500: 'Internal Server Error' } }
}))

describe('GcpCloudFunctionsHttpErrorHandler', () => {
  let mockLogger: ILogger
  let mockBlueprint: IBlueprint
  let handler: GcpCloudFunctionsHttpErrorHandler
  let mockContext: AdapterErrorContext<any, any, any>

  beforeEach(() => {
    mockLogger = {
      error: vi.fn()
    } as unknown as ILogger

    vi.spyOn(process, 'exit').mockImplementation(() => 0 as never)

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

    handler = new GcpCloudFunctionsHttpErrorHandler({ blueprint: mockBlueprint })
  })

  test('should handle an error and return a response with correct headers', () => {
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

  test('should default to text/plain if mime.getType returns undefined', () => {
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

  test('should handle false return from accepts.type', () => {
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
