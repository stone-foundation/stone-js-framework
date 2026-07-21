import bytes from 'bytes'
import typeIs from 'type-is'
import { Mock } from 'vitest'
import { isMultipart, getCharset } from '@stone-js/http-core'
import { TencentScfHttpAdapterContext } from '../../src/declarations'
import { BodyEventMiddleware } from '../../src/middleware/BodyEventMiddleware'
import { TencentScfHttpAdapterError } from '../../src/errors/TencentScfHttpAdapterError'

vi.mock('bytes')
vi.mock('type-is')
vi.mock('raw-body')
vi.mock('co-body')

vi.mock('@stone-js/http-core', () => ({
  getType: vi.fn(),
  getCharset: vi.fn(),
  isMultipart: vi.fn(),
  getHttpError: vi.fn()
}))

describe('BodyEventMiddleware', () => {
  let next: Mock
  let mockBlueprint: any
  let middleware: BodyEventMiddleware
  let mockContext: TencentScfHttpAdapterContext

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
    } as unknown as TencentScfHttpAdapterContext

    next = vi.fn()
  })

  it('should throw an error if context is missing required components', async () => {
    // @ts-expect-error
    mockContext.rawEvent = undefined

    await expect(middleware.handle(mockContext, next)).rejects.toThrow(TencentScfHttpAdapterError)

    // @ts-expect-error
    mockContext.rawEvent = {}
    // @ts-expect-error
    mockContext.incomingEventBuilder = null

    await expect(middleware.handle(mockContext, next)).rejects.toThrow(TencentScfHttpAdapterError)
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
    vi.mocked(typeIs.is).mockReturnValue(false)

    await middleware.handle(mockContext, next)

    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('body', {})
    expect(next).toHaveBeenCalledWith(mockContext)
  })

  it('should parse and add JSON body to the event builder', async () => {
    vi.mocked(isMultipart).mockReturnValue(false)
    vi.mocked(typeIs.hasBody).mockReturnValue(true)
    vi.mocked(getCharset).mockReturnValue('utf-8')
    vi.mocked(typeIs.is).mockReturnValue('json')

    mockContext.rawEvent.body = { key: 'value', $method$: 'POST' }

    await middleware.handle(mockContext, next)

    expect(mockBlueprint.get).toHaveBeenCalledWith('stone.http.body', expect.any(Object))
    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('body', { key: 'value', $method$: 'POST' })
    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('method', 'POST')
    expect(next).toHaveBeenCalledWith(mockContext)
  })

  it('should parse and add text body to the event builder', async () => {
    vi.mocked(isMultipart).mockReturnValue(false)
    vi.mocked(typeIs.hasBody).mockReturnValue(true)
    vi.mocked(getCharset).mockReturnValue('utf-8')
    vi.mocked(typeIs).mockReturnValue('text')

    mockContext.rawEvent.body = '<h1>Hello, world!</h1>'

    await middleware.handle(mockContext, next)

    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('body', '<h1>Hello, world!</h1>')
    expect(next).toHaveBeenCalledWith(mockContext)
  })

  it('should throw an error when body length exeeced the limit', async () => {
    vi.mocked(isMultipart).mockReturnValue(false)
    vi.mocked(typeIs.hasBody).mockReturnValue(true)
    vi.mocked(typeIs.is).mockReturnValue('sting')
    vi.mocked(bytes.parse).mockReturnValueOnce(10) // 10-byte limit, only for this call

    // A real oversized body: the limit is measured on the decoded byte length.
    mockContext.rawEvent.body = 'x'.repeat(50)

    await expect(async () => await middleware.handle(mockContext, next)).rejects.toThrow(TencentScfHttpAdapterError)
    expect(next).not.toHaveBeenCalledWith(mockContext)
  })

  it('should decode base64 body using encoding', async () => {
    vi.mocked(isMultipart).mockReturnValue(false)
    vi.mocked(typeIs.hasBody).mockReturnValue(true)
    vi.mocked(typeIs).mockReturnValue('text')
    vi.mocked(getCharset).mockReturnValue('utf-8')

    const base64 = Buffer.from('hello world').toString('base64')

    mockContext.rawEvent.body = base64
    mockContext.rawEvent.isBase64Encoded = true

    await middleware.handle(mockContext, next)

    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('body', 'hello world')
  })

  it('should parse urlencoded body into URLSearchParams', async () => {
    vi.mocked(isMultipart).mockReturnValue(false)
    vi.mocked(typeIs.hasBody).mockReturnValue(true)
    vi.mocked(typeIs).mockReturnValue('urlencoded')
    vi.mocked(getCharset).mockReturnValue('utf-8')

    mockContext.rawEvent.body = 'key=value&foo=bar'

    await middleware.handle(mockContext, next)

    const call = (mockContext.incomingEventBuilder?.add as Mock).mock.calls.find(c => c[0] === 'body')
    const params = call?.[1]

    expect(params).toBeInstanceOf(URLSearchParams)
    expect(params.get('key')).toBe('value')
    expect(params.get('foo')).toBe('bar')
  })

  it('should parse binary body into Buffer', async () => {
    vi.mocked(isMultipart).mockReturnValue(false)
    vi.mocked(typeIs.hasBody).mockReturnValue(true)
    vi.mocked(typeIs).mockReturnValue('bin')
    vi.mocked(getCharset).mockReturnValue('utf-8')

    mockContext.rawEvent.body = 'hello'

    await middleware.handle(mockContext, next)

    const call = (mockContext.incomingEventBuilder?.add as Mock).mock.calls.find(c => c[0] === 'body')
    const buffer = call?.[1]

    expect(Buffer.isBuffer(buffer)).toBe(true)
    expect(buffer.toString()).toBe('hello')
  })

  it('should return empty object for unknown type', async () => {
    vi.mocked(isMultipart).mockReturnValue(false)
    vi.mocked(typeIs.hasBody).mockReturnValue(true)
    vi.mocked(typeIs).mockReturnValue('unknown-type')
    vi.mocked(getCharset).mockReturnValue('utf-8')

    mockContext.rawEvent.body = 'whatever'

    await middleware.handle(mockContext, next)

    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('body', {})
  })

  it('should throw TencentScfHttpAdapterError when JSON parsing fails', async () => {
    vi.mocked(isMultipart).mockReturnValue(false)
    vi.mocked(typeIs.hasBody).mockReturnValue(true)
    vi.mocked(typeIs).mockReturnValue('json')
    vi.mocked(getCharset).mockReturnValue('utf-8')

    mockContext.rawEvent.body = '{ invalid json'

    await expect(middleware.handle(mockContext, next))
      .rejects.toThrow(TencentScfHttpAdapterError)
  })

  it('should stringify object body before parsing', async () => {
    vi.mocked(isMultipart).mockReturnValue(false)
    vi.mocked(typeIs.hasBody).mockReturnValue(true)
    vi.mocked(typeIs).mockReturnValue('json')
    vi.mocked(getCharset).mockReturnValue('utf-8')

    mockContext.rawEvent.body = { key: 'value' }

    await middleware.handle(mockContext, next)

    expect(mockContext.incomingEventBuilder?.add).toHaveBeenCalledWith('body', { key: 'value' })
  })
})
