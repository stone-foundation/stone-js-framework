import proxyAddr from 'proxy-addr'
import { NextMiddleware } from '@stone-js/core'
import { AwsLambdaHttpAdapterError } from '../../src/errors/AwsLambdaHttpAdapterError'
import { IncomingEventMiddleware } from '../../src/middleware/IncomingEventMiddleware'
import { getProtocol, CookieCollection, getHostname, isIpTrusted } from '@stone-js/http-core'
import { AwsLambdaHttpAdapterContext, AwsLambdaHttpAdapterResponseBuilder } from '../../src/declarations'

vi.mock('proxy-addr', () => ({ default: Object.assign(vi.fn(() => '1.2.3.4'), { all: vi.fn(() => ['1.2.3.4']) }) }))

vi.mock('@stone-js/http-core', () => ({
  getProtocol: vi.fn(() => 'https'),
  getHostname: vi.fn(() => 'example.com'),
  isIpTrusted: vi.fn(() => () => true),
  CookieCollection: { create: vi.fn((v: string) => ({ raw: v })) }
}))

const makeContext = (rawEvent: any): AwsLambdaHttpAdapterContext => ({
  rawEvent,
  rawResponse: {},
  executionContext: { awsRequestId: 'abc' },
  incomingEventBuilder: {
    add: vi.fn().mockReturnThis(),
    addIf: vi.fn().mockReturnThis()
  }
} as unknown as AwsLambdaHttpAdapterContext)

// Extract the value passed to `builder.add(key, ...)` / `addIf` for assertions.
const added = (ctx: any, key: string): any => ctx.incomingEventBuilder.add.mock.calls.find((c: any[]) => c[0] === key)?.[1]
const addedIf = (ctx: any, key: string): any => ctx.incomingEventBuilder.addIf.mock.calls.find((c: any[]) => c[0] === key)?.[1]

describe('IncomingEventMiddleware', () => {
  let middleware: IncomingEventMiddleware
  let next: NextMiddleware<AwsLambdaHttpAdapterContext, AwsLambdaHttpAdapterResponseBuilder>

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
    await expect(middleware.handle({} as any, next)).rejects.toThrow(AwsLambdaHttpAdapterError)
  })

  it('normalizes an API Gateway REST v1 event (method, path, query, cookies, rawBody)', async () => {
    const ctx = makeContext({
      httpMethod: 'POST',
      path: '/users',
      queryStringParameters: { q: 'a' },
      multiValueQueryStringParameters: { tag: ['x', 'y'] },
      headers: { Cookie: 'sid=1; theme=dark', Host: 'example.com' },
      body: 'hello',
      requestContext: { identity: { sourceIp: '9.9.9.9' } }
    })

    await middleware.handle(ctx, next)

    expect(added(ctx, 'url').toString()).toBe('https://example.com/users?tag=x&tag=y')
    expect(added(ctx, 'queryString')).toBe('tag=x&tag=y')
    expect(addedIf(ctx, 'method')).toBe('POST')
    expect(added(ctx, 'metadata')).toEqual({ rawBody: 'hello' })
    expect(CookieCollection.create).toHaveBeenCalledWith('sid=1; theme=dark', expect.anything(), expect.anything())
    expect(next).toHaveBeenCalled()
  })

  it('normalizes an API Gateway HTTP API v2 event (rawPath, rawQueryString, cookies[])', async () => {
    const ctx = makeContext({
      version: '2.0',
      rawPath: '/items',
      rawQueryString: 'page=2&sort=asc',
      cookies: ['sid=2', 'lang=fr'],
      headers: { 'content-type': 'application/json' },
      requestContext: { http: { method: 'GET', sourceIp: '8.8.8.8' } }
    })

    await middleware.handle(ctx, next)

    expect(added(ctx, 'url').toString()).toBe('https://example.com/items?page=2&sort=asc')
    expect(added(ctx, 'queryString')).toBe('page=2&sort=asc')
    expect(addedIf(ctx, 'method')).toBe('GET')
    // v2 cookies[] are joined into a single cookie header for CookieCollection.
    expect(CookieCollection.create).toHaveBeenCalledWith('sid=2; lang=fr', expect.anything(), expect.anything())
  })

  it('normalizes an ALB event (elb requestContext, base64 body → Buffer rawBody)', async () => {
    const ctx = makeContext({
      httpMethod: 'PUT',
      path: '/upload',
      headers: { 'x-forwarded-for': '5.5.5.5', 'content-type': 'application/octet-stream' },
      body: Buffer.from([0xff, 0x00, 0x10]).toString('base64'),
      isBase64Encoded: true,
      requestContext: { elb: { targetGroupArn: 'arn:...' } }
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
