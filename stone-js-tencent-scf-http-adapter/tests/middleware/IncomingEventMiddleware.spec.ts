import proxyAddr from 'proxy-addr'
import { NextMiddleware } from '@stone-js/core'
import { TencentScfHttpAdapterError } from '../../src/errors/TencentScfHttpAdapterError'
import { IncomingEventMiddleware } from '../../src/middleware/IncomingEventMiddleware'
import { getProtocol, CookieCollection, getHostname, isIpTrusted } from '@stone-js/http-core'
import { TencentScfHttpAdapterContext, TencentScfHttpAdapterResponseBuilder } from '../../src/declarations'

vi.mock('proxy-addr', () => ({ default: Object.assign(vi.fn(() => '1.2.3.4'), { all: vi.fn(() => ['1.2.3.4']) }) }))

vi.mock('@stone-js/http-core', () => ({
  getProtocol: vi.fn(() => 'https'),
  getHostname: vi.fn(() => 'example.com'),
  isIpTrusted: vi.fn(() => () => true),
  CookieCollection: { create: vi.fn((v: string) => ({ raw: v })) }
}))

const makeContext = (rawEvent: any): TencentScfHttpAdapterContext => ({
  rawEvent,
  rawResponse: {},
  executionContext: { awsRequestId: 'abc' },
  incomingEventBuilder: {
    add: vi.fn().mockReturnThis(),
    addIf: vi.fn().mockReturnThis()
  }
} as unknown as TencentScfHttpAdapterContext)

// Extract the value passed to `builder.add(key, ...)` / `addIf` for assertions.
const added = (ctx: any, key: string): any => ctx.incomingEventBuilder.add.mock.calls.find((c: any[]) => c[0] === key)?.[1]
const addedIf = (ctx: any, key: string): any => ctx.incomingEventBuilder.addIf.mock.calls.find((c: any[]) => c[0] === key)?.[1]

describe('IncomingEventMiddleware', () => {
  let middleware: IncomingEventMiddleware
  let next: NextMiddleware<TencentScfHttpAdapterContext, TencentScfHttpAdapterResponseBuilder>

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getProtocol).mockReturnValue('https')
    vi.mocked(getHostname).mockReturnValue('example.com')
    vi.mocked(isIpTrusted).mockReturnValue(() => true)
    vi.mocked(CookieCollection.create).mockImplementation(((v: string) => ({ raw: v })) as any)
    vi.mocked(proxyAddr).mockReturnValue('1.2.3.4')
    vi.mocked(proxyAddr.all).mockReturnValue(['1.2.3.4'])
    middleware = new IncomingEventMiddleware({ blueprint: { get: vi.fn((_k, d) => d) } as any })
    next = vi.fn()
  })

  it('should throw when required components are missing', async () => {
    await expect(middleware.handle({} as any, next)).rejects.toThrow(TencentScfHttpAdapterError)
  })

  it('normalizes an SCF event with multi-value query, cookies and a text body', async () => {
    const ctx = makeContext({
      httpMethod: 'POST',
      path: '/users',
      queryStringParameters: { q: 'a' },
      multiValueQueryStringParameters: { tag: ['x', 'y'] },
      headers: { Cookie: 'sid=1; theme=dark', Host: 'example.com' },
      body: 'hello',
      requestContext: { sourceIp: '9.9.9.9' }
    })

    await middleware.handle(ctx, next)

    expect(added(ctx, 'url').toString()).toBe('https://example.com/users?tag=x&tag=y')
    expect(added(ctx, 'queryString')).toBe('tag=x&tag=y')
    expect(addedIf(ctx, 'method')).toBe('POST')
    expect(added(ctx, 'metadata')).toEqual({ rawBody: 'hello' })
    expect(CookieCollection.create).toHaveBeenCalledWith('sid=1; theme=dark', expect.anything(), expect.anything())
    expect(next).toHaveBeenCalled()
  })

  it('normalizes an SCF event with the queryString object and a Cookie header', async () => {
    const ctx = makeContext({
      httpMethod: 'GET',
      path: '/items',
      queryString: { page: '2', sort: 'asc' },
      headers: { 'content-type': 'application/json', cookie: 'sid=2; lang=fr' },
      requestContext: { sourceIp: '8.8.8.8' }
    })

    await middleware.handle(ctx, next)

    expect(added(ctx, 'url').toString()).toBe('https://example.com/items?page=2&sort=asc')
    expect(added(ctx, 'queryString')).toBe('page=2&sort=asc')
    expect(addedIf(ctx, 'method')).toBe('GET')
    expect(CookieCollection.create).toHaveBeenCalledWith('sid=2; lang=fr', expect.anything(), expect.anything())
  })

  it('decodes a base64 body into a Buffer rawBody', async () => {
    const ctx = makeContext({
      httpMethod: 'PUT',
      path: '/upload',
      headers: { 'x-forwarded-for': '5.5.5.5', 'content-type': 'application/octet-stream' },
      body: Buffer.from([0xff, 0x00, 0x10]).toString('base64'),
      isBase64Encoded: true,
      requestContext: {}
    })

    await middleware.handle(ctx, next)

    const rawBody = added(ctx, 'metadata').rawBody
    expect(Buffer.isBuffer(rawBody)).toBe(true)
    expect([...rawBody]).toEqual([0xff, 0x00, 0x10])
    expect(addedIf(ctx, 'method')).toBe('PUT')
  })

  it('tolerates a missing headers object', async () => {
    const ctx = makeContext({ httpMethod: 'GET', path: '/', headers: null, requestContext: {} })
    await expect(middleware.handle(ctx, next)).resolves.not.toThrow()
    expect(added(ctx, 'headers')).toEqual({})
  })
})
