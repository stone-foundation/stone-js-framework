import { Mock } from 'vitest'
import { isMultipart, getFilesUploads } from '@stone-js/http-core'
import { AwsLambdaHttpAdapterContext } from '../../src/declarations'
import { AwsLambdaHttpAdapterError } from '../../src/errors/AwsLambdaHttpAdapterError'
import { FilesEventMiddleware } from '../../src/middleware/FilesEventMiddleware'

vi.mock('@stone-js/http-core')

describe('FilesEventMiddleware', () => {
  let next: Mock
  let mockBlueprint: any
  let middleware: FilesEventMiddleware
  let mockContext: AwsLambdaHttpAdapterContext

  beforeEach(() => {
    mockBlueprint = {
      get: vi.fn(() => ({}))
    }

    middleware = new FilesEventMiddleware({ blueprint: mockBlueprint })

    mockContext = {
      rawEvent: {
        headers: { 'content-type': 'multipart/form-data' }
      },
      incomingEventBuilder: {
        add: vi.fn().mockReturnThis()
      }
    } as unknown as AwsLambdaHttpAdapterContext

    next = vi.fn()
  })

  it('should throw an error if context is missing required components', async () => {
    // @ts-expect-error
    mockContext.rawEvent = undefined

    await expect(middleware.handle(mockContext, next)).rejects.toThrow(AwsLambdaHttpAdapterError)

    // @ts-expect-error
    mockContext.rawEvent = {}
    // @ts-expect-error
    mockContext.incomingEventBuilder = null

    await expect(middleware.handle(mockContext, next)).rejects.toThrow(AwsLambdaHttpAdapterError)
  })

  it('should skip file upload handling if the request is not multipart', async () => {
    vi.mocked(isMultipart).mockReturnValue(false)

    mockContext.rawEvent.headers = { 'Content-Type': 'multipart/form-data' }

    await middleware.handle(mockContext, next)

    expect(next).toHaveBeenCalledWith(mockContext)
    expect(mockBlueprint.get).not.toHaveBeenCalled()
    // @ts-expect-error - Accessing private method for testing
    expect(isMultipart).toHaveBeenCalledWith(middleware.normalizeEvent(mockContext.rawEvent))
  })

  it('should process multipart request and add files and fields to the event builder', async () => {
    vi.mocked(isMultipart).mockReturnValue(true)
    vi.mocked(getFilesUploads).mockResolvedValue({
      files: { filename: [{ name: 'file1.txt', size: 123 }] } as any,
      fields: { key: 'value', $method$: 'POST' } as any
    })

    await middleware.handle(mockContext, next)

    expect(isMultipart).toHaveBeenCalledWith(mockContext.rawEvent)
    expect(mockBlueprint.get).toHaveBeenCalledWith('stone.http.files.upload', {})
    expect(getFilesUploads).toHaveBeenCalledWith(mockContext.rawEvent, {})
    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('files', { filename: [{ name: 'file1.txt', size: 123 }] })
    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('body', { key: 'value', $method$: 'POST' })
    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('method', 'POST')
    expect(next).toHaveBeenCalledWith(mockContext)
  })

  it('should call next even if no multipart files are uploaded', async () => {
    vi.mocked(isMultipart).mockReturnValue(true)
    vi.mocked(getFilesUploads).mockResolvedValue({
      files: {},
      fields: {}
    })

    await middleware.handle(mockContext, next)

    expect(isMultipart).toHaveBeenCalledWith(mockContext.rawEvent)
    expect(getFilesUploads).toHaveBeenCalled()
    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('files', {})
    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('body', {})
    expect(next).toHaveBeenCalledWith(mockContext)
  })

  it('should convert string body to Buffer using utf-8 encoding', async () => {
    vi.mocked(isMultipart).mockImplementation((req: any) => {
      expect(Buffer.isBuffer(req.body)).toBe(true)
      expect(req.body.toString('utf-8')).toBe('hello world')
      return false
    })

    mockContext.rawEvent.body = 'hello world'
    mockContext.rawEvent.isBase64Encoded = false
    mockContext.rawEvent.headers = { 'content-type': 'multipart/form-data' }

    await middleware.handle(mockContext, next)

    expect(next).toHaveBeenCalledWith(mockContext)
  })

  it('should convert base64 string body to Buffer using base64 encoding', async () => {
    const base64 = Buffer.from('hello world').toString('base64')

    vi.mocked(isMultipart).mockImplementation((req: any) => {
      expect(Buffer.isBuffer(req.body)).toBe(true)
      expect(req.body.toString('utf-8')).toBe('hello world')
      return false
    })

    mockContext.rawEvent.body = base64
    mockContext.rawEvent.isBase64Encoded = true
    mockContext.rawEvent.headers = { 'content-type': 'multipart/form-data' }

    await middleware.handle(mockContext, next)

    expect(next).toHaveBeenCalledWith(mockContext)
  })
})
