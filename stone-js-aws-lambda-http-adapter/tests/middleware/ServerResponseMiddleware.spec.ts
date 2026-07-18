import { Mock } from 'vitest'
import statuses from 'statuses'
import { BinaryFileResponse } from '@stone-js/http-core'
import { AwsLambdaHttpAdapterContext } from '../../src/declarations'
import { AwsLambdaHttpAdapterError } from '../../src/errors/AwsLambdaHttpAdapterError'
import { ServerResponseMiddleware } from '../../src/middleware/ServerResponseMiddleware'

/* eslint-disable @typescript-eslint/no-extraneous-class */

vi.mock('@stone-js/http-core', () => ({
  BinaryFileResponse: class {},
  streamFile: vi.fn()
}))

vi.mock('statuses')

describe('ServerResponseMiddleware', () => {
  let next: Mock
  let middleware: ServerResponseMiddleware
  let mockContext: AwsLambdaHttpAdapterContext

  beforeEach(() => {
    middleware = new ServerResponseMiddleware()

    mockContext = {
      rawEvent: {},
      rawResponse: {},
      rawResponseBuilder: {
        add: vi.fn().mockReturnThis()
      },
      incomingEvent: {
        isMethod: vi.fn()
      },
      outgoingResponse: {
        headers: { 'Content-Type': 'application/json' },
        statusCode: 200,
        statusMessage: 'OK',
        content: '{"success": true}',
        charset: 'utf-8'
      }
    } as unknown as AwsLambdaHttpAdapterContext

    next = vi.fn(() => mockContext.rawResponseBuilder)
    vi.mocked(statuses).mockReturnValue({ message: { 500: 'Internal Server Error' } } as any)
  })

  it('should throw an error if context is missing required components', async () => {
    // @ts-expect-error
    mockContext.rawEvent = undefined

    await expect(middleware.handle(mockContext, next)).rejects.toThrow(AwsLambdaHttpAdapterError)

    // @ts-expect-error
    mockContext.rawEvent = {}
    // @ts-expect-error
    mockContext.rawResponseBuilder = null

    await expect(middleware.handle(mockContext, next)).rejects.toThrow(AwsLambdaHttpAdapterError)
  })

  it('should add headers, status code, and status message to the response builder', async () => {
    await middleware.handle(mockContext, next)

    expect(mockContext.rawResponseBuilder?.add).toHaveBeenCalledWith('headers', mockContext.outgoingResponse?.headers)
    expect(mockContext.rawResponseBuilder?.add).toHaveBeenCalledWith('statusCode', 200)
    expect(mockContext.rawResponseBuilder?.add).toHaveBeenCalledWith('statusMessage', 'OK')
  })

  it('should set default status message if not provided', async () => {
    // @ts-expect-error
    mockContext.outgoingResponse.statusCode = undefined
    // @ts-expect-error
    mockContext.outgoingResponse.statusMessage = undefined

    await middleware.handle(mockContext, next)

    expect(mockContext.rawResponseBuilder?.add).toHaveBeenCalledWith('headers', mockContext.outgoingResponse?.headers)
    expect(mockContext.rawResponseBuilder?.add).toHaveBeenCalledWith('statusCode', 500)
    expect(mockContext.rawResponseBuilder?.add).toHaveBeenCalledWith('statusMessage', 'Internal Server Error')
  })

  it('should add a base64 body for a Buffer response (no charset leak into the Lambda response)', async () => {
    // @ts-expect-error
    vi.mocked(mockContext.incomingEvent.isMethod).mockReturnValue(false)
    const content = Buffer.from('{"success": true}')
    // @ts-expect-error
    mockContext.outgoingResponse.content = content

    await middleware.handle(mockContext, next)

    // `charset` is no longer forwarded — it is not part of the API Gateway proxy contract.
    expect(mockContext.rawResponseBuilder?.add).not.toHaveBeenCalledWith('charset', expect.anything())
    expect(mockContext.rawResponseBuilder?.add).toHaveBeenCalledWith('isBase64Encoded', true)
    expect(mockContext.rawResponseBuilder?.add).toHaveBeenCalledWith('body', content.toString('base64'))
  })

  it('should stream file if the response is a BinaryFileResponse', async () => {
    const mockFile = { getContent: () => 'file content' }
    // @ts-expect-error
    mockContext.outgoingResponse = new BinaryFileResponse()
    // @ts-expect-error
    mockContext.outgoingResponse.file = mockFile

    // @ts-expect-error
    vi.mocked(mockContext.incomingEvent.isMethod).mockReturnValue(false)

    await middleware.handle(mockContext, next)

    expect(mockContext.rawResponseBuilder?.add).toHaveBeenCalledWith('body', 'file content')
  })

  it('should not add body or stream file if the method is HEAD', async () => {
    // @ts-expect-error
    vi.mocked(mockContext.incomingEvent.isMethod).mockReturnValue(true)

    await middleware.handle(mockContext, next)

    expect(mockContext.rawResponseBuilder?.add).not.toHaveBeenCalledWith('body', expect.anything())
    expect(mockContext.rawResponseBuilder?.add).not.toHaveBeenCalledWith('streamFile', expect.anything())
  })

  it('should call next with the modified context', async () => {
    await middleware.handle(mockContext, next)

    expect(next).toHaveBeenCalledWith(mockContext)
  })
})
