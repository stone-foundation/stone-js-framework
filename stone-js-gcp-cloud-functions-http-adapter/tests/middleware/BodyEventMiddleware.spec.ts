import bytes from 'bytes'
import typeIs from 'type-is'
import { Mock } from 'vitest'
import rawBody from 'raw-body'
import bodyParser from 'co-body'
import { isMultipart, getCharset } from '@stone-js/http-core'
import { GcpCloudFunctionsHttpAdapterContext } from '../../src/declarations'
import { GcpCloudFunctionsHttpAdapterError } from '../../src/errors/GcpCloudFunctionsHttpAdapterError'
import { BodyEventMiddleware } from '../../src/middleware/BodyEventMiddleware'

vi.mock('bytes')
vi.mock('type-is')
vi.mock('co-body')
vi.mock('raw-body')

vi.mock('@stone-js/http-core', () => ({
  getCharset: vi.fn(),
  isMultipart: vi.fn()
}))

describe('BodyEventMiddleware', () => {
  let middleware: BodyEventMiddleware
  let mockBlueprint: any
  let mockContext: GcpCloudFunctionsHttpAdapterContext
  let next: Mock

  beforeEach(() => {
    mockBlueprint = {
      get: vi.fn(() => ({
        limit: '100kb',
        defaultType: 'json',
        defaultCharset: 'utf-8'
      }))
    }

    middleware = new BodyEventMiddleware({ blueprint: mockBlueprint })

    mockContext = {
      rawEvent: {
        headers: { 'content-type': 'application/json', 'content-length': '123' }
      },
      incomingEventBuilder: {
        add: vi.fn().mockReturnThis()
      }
    } as unknown as GcpCloudFunctionsHttpAdapterContext

    next = vi.fn()
  })

  it('should throw an error if context is missing required components', async () => {
    // @ts-expect-error
    mockContext.rawEvent = undefined

    await expect(middleware.handle(mockContext, next)).rejects.toThrow(GcpCloudFunctionsHttpAdapterError)

    // @ts-expect-error
    mockContext.rawEvent = {}
    // @ts-expect-error
    mockContext.incomingEventBuilder = null

    await expect(middleware.handle(mockContext, next)).rejects.toThrow(GcpCloudFunctionsHttpAdapterError)
  })

  it('should skip body parsing if the request is multipart', async () => {
    vi.mocked(isMultipart).mockReturnValue(true)

    await middleware.handle(mockContext, next)

    expect(isMultipart).toHaveBeenCalledWith(mockContext.rawEvent)
    expect(mockContext.incomingEventBuilder?.add).not.toHaveBeenCalledWith('body', expect.anything())
    expect(next).toHaveBeenCalledWith(mockContext)
  })

  it('should parse and add empty object body to the event builder when request has no body', async () => {
    vi.mocked(isMultipart).mockReturnValue(false)
    vi.mocked(typeIs.hasBody).mockReturnValue(false)

    await middleware.handle(mockContext, next)

    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('body', {})
    expect(next).toHaveBeenCalledWith(mockContext)
  })

  it('should parse and add empty object body to the event builder on invalid type', async () => {
    vi.mocked(isMultipart).mockReturnValue(false)
    vi.mocked(typeIs.hasBody).mockReturnValue(true)
    vi.mocked(typeIs).mockReturnValue('html')

    await middleware.handle(mockContext, next)

    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('body', {})
    expect(next).toHaveBeenCalledWith(mockContext)
  })

  it('should parse and add JSON body to the event builder', async () => {
    vi.mocked(isMultipart).mockReturnValue(false)
    vi.mocked(typeIs.hasBody).mockReturnValue(true)
    vi.mocked(bytes.parse).mockReturnValue(102400)
    vi.mocked(getCharset).mockReturnValue('utf-8')
    vi.mocked(typeIs).mockReturnValue(null)
    vi.mocked(bodyParser.json).mockResolvedValue({ parsed: { key: 'value' }, raw: '{"key":"value"}' } as any)

    await middleware.handle(mockContext, next)

    expect(mockBlueprint.get).toHaveBeenCalledWith('stone.http.body', expect.any(Object))
    expect(bodyParser.json).toHaveBeenCalledWith(mockContext.rawEvent, { limit: 102400, encoding: 'utf-8', returnRawBody: true })
    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('body', { key: 'value' })
    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('metadata', { rawBody: '{"key":"value"}' })
    expect(next).toHaveBeenCalledWith(mockContext)
  })

  it('should parse and add text body to the event builder', async () => {
    vi.mocked(isMultipart).mockReturnValue(false)
    vi.mocked(typeIs.hasBody).mockReturnValue(true)
    vi.mocked(bytes.parse).mockReturnValue(102400)
    vi.mocked(getCharset).mockReturnValue('utf-8')
    vi.mocked(typeIs).mockReturnValue('text')
    vi.mocked(bodyParser.text).mockResolvedValue({ parsed: 'Hello, world!', raw: 'Hello, world!' } as any)

    await middleware.handle(mockContext, next)

    expect(bodyParser.text).toHaveBeenCalledWith(mockContext.rawEvent, { limit: 102400, encoding: 'utf-8', returnRawBody: true })
    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('body', 'Hello, world!')
    expect(next).toHaveBeenCalledWith(mockContext)
  })

  it('should parse and add URL-encoded form body to the event builder', async () => {
    vi.mocked(isMultipart).mockReturnValue(false)
    vi.mocked(typeIs.hasBody).mockReturnValue(true)
    vi.mocked(bytes.parse).mockReturnValue(102400)
    vi.mocked(getCharset).mockReturnValue('utf-8')
    vi.mocked(typeIs).mockReturnValue('urlencoded')
    vi.mocked(bodyParser.form).mockResolvedValue({ parsed: { name: 'test' }, raw: 'name=test' } as any)

    await middleware.handle(mockContext, next)

    expect(bodyParser.form).toHaveBeenCalledWith(mockContext.rawEvent, { limit: 102400, encoding: 'utf-8', returnRawBody: true })
    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('body', { name: 'test' })
    expect(next).toHaveBeenCalledWith(mockContext)
  })

  it('should parse binary body', async () => {
    vi.mocked(isMultipart).mockReturnValue(false)
    vi.mocked(typeIs.hasBody).mockReturnValue(true)
    vi.mocked(bytes.parse).mockReturnValue(102400)
    vi.mocked(getCharset).mockReturnValue('utf-8')
    vi.mocked(typeIs).mockReturnValue('bin')
    vi.mocked(rawBody).mockResolvedValue(Buffer.from('binary data'))

    await middleware.handle(mockContext, next)

    expect(rawBody).toHaveBeenCalledWith(mockContext.rawEvent, { length: '123', limit: 102400 })
    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('body', Buffer.from('binary data'))
    expect(next).toHaveBeenCalledWith(mockContext)
  })

  it('applies a safe method override from a POST form body', async () => {
    (mockContext.rawEvent as any).method = 'POST'
    vi.mocked(isMultipart).mockReturnValue(false)
    vi.mocked(typeIs.hasBody).mockReturnValue(true)
    vi.mocked(bytes.parse).mockReturnValue(102400)
    vi.mocked(getCharset).mockReturnValue('utf-8')
    vi.mocked(typeIs).mockReturnValue('urlencoded')
    vi.mocked(bodyParser.form).mockResolvedValue({ parsed: { $method$: 'DELETE' }, raw: '$method$=DELETE' } as any)

    await middleware.handle(mockContext, next)

    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('method', 'DELETE')
  })

  it('should handle body parsing errors and throw GcpCloudFunctionsHttpAdapterError', async () => {
    const mockError = new Error('Invalid JSON')
    vi.mocked(isMultipart).mockReturnValue(false)
    vi.mocked(typeIs.hasBody).mockReturnValue(true)
    vi.mocked(bytes.parse).mockReturnValue(102400)
    vi.mocked(getCharset).mockReturnValue('utf-8')
    vi.mocked(typeIs).mockReturnValue('json')
    vi.mocked(bodyParser.json).mockRejectedValue(mockError)

    await expect(middleware.handle(mockContext, next)).rejects.toThrow(GcpCloudFunctionsHttpAdapterError)
  })

  it('wraps a non-Error parsing rejection too', async () => {
    vi.mocked(isMultipart).mockReturnValue(false)
    vi.mocked(typeIs.hasBody).mockReturnValue(true)
    vi.mocked(bytes.parse).mockReturnValue(102400)
    vi.mocked(getCharset).mockReturnValue('utf-8')
    vi.mocked(typeIs).mockReturnValue('json')
    vi.mocked(bodyParser.json).mockRejectedValue('boom' as any)

    await expect(middleware.handle(mockContext, next)).rejects.toThrow(GcpCloudFunctionsHttpAdapterError)
  })

  it('uses the body already parsed by the Functions Framework', async () => {
    vi.mocked(isMultipart).mockReturnValue(false)
    ;(mockContext.rawEvent as any).body = { key: 'value' }
    ;(mockContext.rawEvent as any).rawBody = Buffer.from('{"key":"value"}')

    await middleware.handle(mockContext, next)

    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('body', { key: 'value' })
    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('metadata', { rawBody: '{"key":"value"}' })
    expect(next).toHaveBeenCalledWith(mockContext)
  })

  it('exposes an undefined raw payload when the framework parsed a body but left no rawBody', async () => {
    vi.mocked(isMultipart).mockReturnValue(false)
    ;(mockContext.rawEvent as any).body = { a: 1 }

    await middleware.handle(mockContext, next)

    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('metadata', { rawBody: undefined })
  })

  it('parses a JSON rawBody buffer (GCP drained-stream path)', async () => {
    vi.mocked(isMultipart).mockReturnValue(false)
    vi.mocked(typeIs.hasBody).mockReturnValue(true)
    vi.mocked(bytes.parse).mockReturnValue(102400)
    vi.mocked(getCharset).mockReturnValue('utf-8')
    vi.mocked(typeIs).mockReturnValue('json')
    ;(mockContext.rawEvent as any).rawBody = Buffer.from('{"a":1}')

    await middleware.handle(mockContext, next)

    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('body', { a: 1 })
    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('metadata', { rawBody: '{"a":1}' })
  })

  it('treats an empty JSON rawBody buffer as an empty object', async () => {
    vi.mocked(isMultipart).mockReturnValue(false)
    vi.mocked(typeIs.hasBody).mockReturnValue(true)
    vi.mocked(bytes.parse).mockReturnValue(102400)
    vi.mocked(getCharset).mockReturnValue('utf-8')
    vi.mocked(typeIs).mockReturnValue('json')
    ;(mockContext.rawEvent as any).rawBody = Buffer.from('')

    await middleware.handle(mockContext, next)

    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('body', {})
  })

  it('parses a urlencoded rawBody buffer', async () => {
    vi.mocked(isMultipart).mockReturnValue(false)
    vi.mocked(typeIs.hasBody).mockReturnValue(true)
    vi.mocked(bytes.parse).mockReturnValue(102400)
    vi.mocked(getCharset).mockReturnValue('utf-8')
    vi.mocked(typeIs).mockReturnValue('urlencoded')
    ;(mockContext.rawEvent as any).rawBody = Buffer.from('name=test&x=1')

    await middleware.handle(mockContext, next)

    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('body', { name: 'test', x: '1' })
  })

  it('parses a text rawBody buffer', async () => {
    vi.mocked(isMultipart).mockReturnValue(false)
    vi.mocked(typeIs.hasBody).mockReturnValue(true)
    vi.mocked(bytes.parse).mockReturnValue(102400)
    vi.mocked(getCharset).mockReturnValue('utf-8')
    vi.mocked(typeIs).mockReturnValue('text')
    ;(mockContext.rawEvent as any).rawBody = Buffer.from('hello')

    await middleware.handle(mockContext, next)

    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('body', 'hello')
  })

  it('returns the raw buffer for a binary rawBody', async () => {
    const buffer = Buffer.from('bin')
    vi.mocked(isMultipart).mockReturnValue(false)
    vi.mocked(typeIs.hasBody).mockReturnValue(true)
    vi.mocked(bytes.parse).mockReturnValue(102400)
    vi.mocked(getCharset).mockReturnValue('utf-8')
    vi.mocked(typeIs).mockReturnValue('bin')
    ;(mockContext.rawEvent as any).rawBody = buffer

    await middleware.handle(mockContext, next)

    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('body', buffer)
    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('metadata', { rawBody: buffer })
  })

  it('returns an empty object for an unknown rawBody content type', async () => {
    vi.mocked(isMultipart).mockReturnValue(false)
    vi.mocked(typeIs.hasBody).mockReturnValue(true)
    vi.mocked(bytes.parse).mockReturnValue(102400)
    vi.mocked(getCharset).mockReturnValue('utf-8')
    vi.mocked(typeIs).mockReturnValue('html')
    ;(mockContext.rawEvent as any).rawBody = Buffer.from('<x/>')

    await middleware.handle(mockContext, next)

    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('body', {})
  })

  it('falls back to the default content type when the rawBody type is undetected', async () => {
    vi.mocked(isMultipart).mockReturnValue(false)
    vi.mocked(typeIs.hasBody).mockReturnValue(true)
    vi.mocked(bytes.parse).mockReturnValue(102400)
    vi.mocked(getCharset).mockReturnValue('utf-8')
    vi.mocked(typeIs).mockReturnValue(null)
    ;(mockContext.rawEvent as any).rawBody = Buffer.from('{"z":9}')

    await middleware.handle(mockContext, next)

    // The blueprint mock returns defaultType 'json', so the buffer is parsed as JSON.
    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('body', { z: 9 })
  })

  it('throws when the rawBody buffer exceeds the configured limit', async () => {
    vi.mocked(isMultipart).mockReturnValue(false)
    vi.mocked(typeIs.hasBody).mockReturnValue(true)
    vi.mocked(bytes.parse).mockReturnValue(2)
    vi.mocked(getCharset).mockReturnValue('utf-8')
    vi.mocked(typeIs).mockReturnValue('json')
    ;(mockContext.rawEvent as any).rawBody = Buffer.from('way too large')

    await expect(middleware.handle(mockContext, next)).rejects.toThrow(GcpCloudFunctionsHttpAdapterError)
  })
})
