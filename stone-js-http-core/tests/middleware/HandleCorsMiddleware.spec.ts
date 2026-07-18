import { IBlueprint } from '@stone-js/core'
import { HttpMethods } from '../../src/declarations'
import { IncomingHttpEvent } from '../../src/IncomingHttpEvent'
import { httpCoreBlueprint } from '../../src/options/HttpConfig'
import { OutgoingHttpResponse } from '../../src/OutgoingHttpResponse'
import { HandleCorsMiddleware } from '../../src/middleware/HandleCorsMiddleware'

// Make a blueprint
const makeBlueprint = (options: any): IBlueprint => {
  return {
    get: vi.fn().mockReturnValue({ ...httpCoreBlueprint.stone.http.cors, ...options })
  } as unknown as IBlueprint
}

describe('HandleCorsMiddleware', () => {
  let blueprint: any
  let outgoingResponse: OutgoingHttpResponse

  beforeEach(() => {
    blueprint = makeBlueprint({
      origin: '*',
      preflightContinue: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      successStatus: 204
    })
    outgoingResponse = OutgoingHttpResponse.create({ content: 'Hello World', statusCode: 200 })
  })

  it('should create an instance of HandleCorsMiddleware', () => {
    const middleware = new HandleCorsMiddleware({ blueprint })
    expect(middleware).toBeInstanceOf(HandleCorsMiddleware)
  })

  it('should add CORS headers to the response', async () => {
    const blueprint = makeBlueprint({
      origin: 'https://example.com',
      credentials: true,
      exposedHeaders: 'Accept,Content-Type',
      successStatus: 204
    })
    const incomingEvent = IncomingHttpEvent.create({
      ip: '127.0.0.1',
      source: {} as any,
      method: HttpMethods.GET,
      url: new URL('https://example.com'),
      headers: { origin: 'https://example.com' }
    })

    const middleware = new HandleCorsMiddleware({ blueprint })
    const next = vi.fn().mockImplementation((ctx) => outgoingResponse)
    const response = await middleware.handle(incomingEvent, next)

    expect(response?.getHeader('Access-Control-Allow-Credentials')).toBe('true')
    expect(response?.getHeader('Access-Control-Allow-Origin')).toBe('https://example.com')
    expect(response?.getHeader('Access-Control-Expose-Headers')).toBe('Accept,Content-Type')
  })

  it('should handle OPTIONS method and set preflight headers', async () => {
    const incomingEvent = IncomingHttpEvent.create({
      ip: '127.0.0.1',
      source: {} as any,
      method: HttpMethods.OPTIONS,
      url: new URL('https://example.com'),
      headers: { 'access-control-request-headers': 'Content-Type' }
    })

    const middleware = new HandleCorsMiddleware({ blueprint })
    const next = vi.fn().mockImplementation((ctx) => outgoingResponse)
    const response = await middleware.handle(incomingEvent, next)

    expect(response?.status).toBe(200)
    expect(response?.getHeader('Access-Control-Max-Age')).toBe('86400')
    expect(response?.getHeader('Access-Control-Allow-Origin')).toBe('*')
    expect(response?.getHeader('Vary')).toBe('Access-Control-Request-Headers')
    expect(response?.getHeader('Access-Control-Allow-Headers')).toBe('Content-Type')
    expect(response?.getHeader('Access-Control-Allow-Methods')).toBe('GET,HEAD,PUT,PATCH,POST,DELETE')
  })

  it('should handle OPTIONS method and set preflight headers and return the response on preflightStop', async () => {
    const blueprint = makeBlueprint({
      preflightStop: true,
      allowedHeaders: ['Content-Type'],
      successStatus: undefined,
      methods: ['GET', 'HEAD'],
      origin: ['https://example.com']
    })
    const incomingEvent = IncomingHttpEvent.create({
      ip: '127.0.0.1',
      source: {} as any,
      method: HttpMethods.OPTIONS,
      url: new URL('https://example.com'),
      headers: { origin: 'https://example.com' }
    })

    const middleware = new HandleCorsMiddleware({ blueprint })
    const next = vi.fn().mockImplementation((ctx) => outgoingResponse)
    const response = await middleware.handle(incomingEvent, next)

    expect(response?.status).toBe(204)
    expect(response?.getHeader('Vary')).toBe('Origin')
    expect(response?.getHeader('Access-Control-Max-Age')).toBe('86400')
    expect(response?.getHeader('Access-Control-Allow-Methods')).toBe('GET,HEAD')
    expect(response?.getHeader('Access-Control-Allow-Headers')).toBe('Content-Type')
    expect(response?.getHeader('Access-Control-Allow-Origin')).toBe('https://example.com')
  })

  it('should add credentials header if credentials option is true', async () => {
    const blueprint = makeBlueprint({
      origin: 'https://example.com',
      credentials: true,
      methods: undefined
    })
    const incomingEvent = IncomingHttpEvent.create({
      ip: '127.0.0.1',
      source: {} as any,
      method: HttpMethods.OPTIONS,
      url: new URL('https://example.com'),
      headers: { origin: 'https://example.com' }
    })

    const middleware = new HandleCorsMiddleware({ blueprint })
    const next = vi.fn().mockImplementation((ctx) => outgoingResponse)
    const response = await middleware.handle(incomingEvent, next)

    expect(response?.getHeader('Access-Control-Allow-Methods')).toBe('*')
    expect(response?.getHeader('Access-Control-Allow-Credentials')).toBe('true')
    expect(response?.getHeader('Vary')).toBe('Origin, Access-Control-Request-Headers')
    expect(response?.getHeader('Access-Control-Allow-Origin')).toBe('https://example.com')
  })

  it('should set exposed headers if configured', async () => {
    const blueprint = makeBlueprint({
      origin: ['https://example.org'],
      credentials: true,
      maxAge: 600,
      exposedHeaders: ['X-Custom-Header']
    })
    const incomingEvent = IncomingHttpEvent.create({
      ip: '127.0.0.1',
      source: {} as any,
      method: HttpMethods.OPTIONS,
      url: new URL('https://example.com'),
      headers: { origin: 'https://example.com' }
    })

    const middleware = new HandleCorsMiddleware({ blueprint })
    const next = vi.fn().mockImplementation((ctx) => outgoingResponse)
    const response = await middleware.handle(incomingEvent, next)

    expect(response?.getHeader('Vary')).toContain('Origin')
    expect(response?.getHeader('Access-Control-Allow-Origin')).toBeUndefined()
    expect(response?.getHeader('Access-Control-Expose-Headers')).toBe('X-Custom-Header')
  })

  it('should set max age if configured', async () => {
    const blueprint = makeBlueprint({
      origin: 12,
      credentials: true,
      maxAge: 600
    })
    const incomingEvent = IncomingHttpEvent.create({
      ip: '127.0.0.1',
      source: {} as any,
      method: HttpMethods.OPTIONS,
      url: new URL('https://example.com'),
      headers: { origin: 'https://example.com' }
    })

    const middleware = new HandleCorsMiddleware({ blueprint })
    const next = vi.fn().mockImplementation((ctx) => outgoingResponse)
    const response = await middleware.handle(incomingEvent, next)

    expect(response?.getHeader('Vary')).toContain('Origin')
    expect(response?.getHeader('Access-Control-Max-Age')).toBe('600')
    expect(response?.getHeader('Access-Control-Allow-Origin')).toBeUndefined()
  })
})
