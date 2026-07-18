import { Mock } from 'vitest'
import statuses from 'statuses'
import { BinaryFileResponse } from '@stone-js/http-core'
import { NodeHttpAdapterContext } from '../../src/declarations'
import { NodeHttpAdapterError } from '../../src/errors/NodeHttpAdapterError'
import { ServerResponseMiddleware } from '../../src/middleware/ServerResponseMiddleware'

/* eslint-disable @typescript-eslint/no-extraneous-class */

vi.mock('@stone-js/http-core', () => ({
  BinaryFileResponse: class {},
  streamFile: vi.fn()
}))

vi.mock('statuses')

describe('ServerResponseMiddleware', () => {
  let next: Mock
  let mockBlueprint: any
  let middleware: ServerResponseMiddleware
  let mockContext: NodeHttpAdapterContext

  beforeEach(() => {
    mockBlueprint = {
      get: vi.fn(() => ({}))
    }

    middleware = new ServerResponseMiddleware({ blueprint: mockBlueprint })

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
    } as unknown as NodeHttpAdapterContext

    next = vi.fn(() => mockContext.rawResponseBuilder)
    vi.mocked(statuses).mockReturnValue({ message: { 500: 'Internal Server Error' } } as any)
  })

  it('should throw an error if context is missing required components', async () => {
    // @ts-expect-error
    mockContext.rawEvent = undefined

    await expect(middleware.handle(mockContext, next)).rejects.toThrow(NodeHttpAdapterError)

    // @ts-expect-error
    mockContext.rawEvent = {}
    // @ts-expect-error
    mockContext.rawResponseBuilder = null

    await expect(middleware.handle(mockContext, next)).rejects.toThrow(NodeHttpAdapterError)
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

  it('should add body and charset if the response is not a BinaryFileResponse', async () => {
    // @ts-expect-error
    vi.mocked(mockContext.incomingEvent.isMethod).mockReturnValue(false)

    await middleware.handle(mockContext, next)

    expect(mockContext.rawResponseBuilder?.add).toHaveBeenCalledWith('body', '{"success": true}')
    expect(mockContext.rawResponseBuilder?.add).toHaveBeenCalledWith('charset', 'utf-8')
  })

  it('should stream file if the response is a BinaryFileResponse', async () => {
    const mockFile = {}
    // @ts-expect-error
    mockContext.outgoingResponse = new BinaryFileResponse()
    // @ts-expect-error
    mockContext.outgoingResponse.file = mockFile

    vi.mocked(mockBlueprint.get).mockReturnValue({})
    // @ts-expect-error
    vi.mocked(mockContext.incomingEvent.isMethod).mockReturnValue(false)

    await middleware.handle(mockContext, next)

    expect(mockContext.rawResponseBuilder?.add).toHaveBeenCalledWith(
      'streamFile',
      expect.any(Function)
    )
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
