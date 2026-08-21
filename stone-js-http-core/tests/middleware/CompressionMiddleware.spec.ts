import * as zlib from 'node:zlib'
import { OutgoingResponse } from '@stone-js/core'
import { OutgoingHttpResponse } from '../../src/OutgoingHttpResponse'
import { CompressionMiddleware } from '../../src/middleware/CompressionMiddleware'

// Real zlib, with one seam: a flag that makes gzip fail, so the fallback path can be exercised
// without pretending the whole module away.
let gzipFails = false

vi.mock('node:zlib', async (mod) => {
  const actual = await mod<typeof import('node:zlib')>()
  return {
    ...actual,
    gzip: (buffer: any, callback: any) => gzipFails
      ? callback(new Error('boom'))
      : actual.gzip(buffer, callback)
  }
})

/**
 * Real responses and real zlib, on purpose.
 *
 * These assertions used to be about whether `setHeader` had been called on an object literal, which
 * can pass while nothing is compressed and while the response type is wrong. What matters is that
 * the bytes coming out decompress back to the bytes going in, and that the headers a cache reads say
 * so. Only the event is a stand-in: the middleware reads one header from it, and the response is the
 * subject.
 */
describe('CompressionMiddleware', () => {
  let middleware: CompressionMiddleware

  /** The middleware reads exactly one thing from the event. */
  const eventAccepting = (encodings: string): any => ({ getHeader: vi.fn().mockReturnValue(encodings) })

  const httpResponse = (content: unknown): OutgoingHttpResponse =>
    OutgoingHttpResponse.create({ content, statusCode: 200 })

  const nextReturning = (response: unknown): any => vi.fn().mockResolvedValue(response)

  // Above the middleware's 1 kB threshold, which is the case that was broken.
  const LARGE = 'Write the domain once, run it anywhere. '.repeat(40)

  beforeEach(() => {
    gzipFails = false
    middleware = new CompressionMiddleware()
  })

  it.each([
    ['gzip', (buffer: Buffer) => zlib.gunzipSync(buffer)],
    ['deflate', (buffer: Buffer) => zlib.inflateSync(buffer)],
    ['br', (buffer: Buffer) => zlib.brotliDecompressSync(buffer)]
  ])('compresses with %s, and the bytes decompress back', async (encoding, decompress) => {
    const response = await middleware.handle(eventAccepting(encoding), nextReturning(httpResponse(LARGE)))

    expect(response.getHeader('Content-Encoding')).toBe(encoding)
    expect(decompress(response.content as Buffer).toString('utf-8')).toBe(LARGE)
    // A cache must not reuse an encoded body for a client that asked for another encoding, and the
    // length it was told no longer matches what it holds.
    expect(response.vary).toContain('Accept-Encoding')
    expect(response.hasHeader('Content-Length')).toBe(false)
  })

  it('picks brotli first when the client accepts several', async () => {
    const response = await middleware.handle(eventAccepting('deflate, gzip, br'), nextReturning(httpResponse(LARGE)))

    expect(response.getHeader('Content-Encoding')).toBe('br')
  })

  it('leaves the body alone when the client accepts nothing it can produce', async () => {
    const response = await middleware.handle(eventAccepting('identity'), nextReturning(httpResponse(LARGE)))

    expect(response.getHeader('Content-Encoding')).toBeUndefined()
    expect(response.content).toBe(LARGE)
    // Still declared: the response was negotiable even though this client got the plain form.
    expect(response.vary).toContain('Accept-Encoding')
  })

  it('leaves a body under 1 kB alone, headers included', async () => {
    const response = await middleware.handle(eventAccepting('gzip'), nextReturning(httpResponse('Short content')))

    expect(response.content).toBe('Short content')
    expect(response.getHeader('Content-Encoding')).toBeUndefined()
    expect(response.vary).not.toContain('Accept-Encoding')
  })

  it('compresses a Buffer whatever its size, since a Buffer is already bytes', async () => {
    const response = await middleware.handle(eventAccepting('gzip'), nextReturning(httpResponse(Buffer.from('small'))))

    expect(response.getHeader('Content-Encoding')).toBe('gzip')
    expect(zlib.gunzipSync(response.content as Buffer).toString('utf-8')).toBe('small')
  })

  it('has nothing to compress when there is no body', async () => {
    const response = await middleware.handle(eventAccepting('gzip'), nextReturning(httpResponse(null)))

    expect(response.getHeader('Content-Encoding')).toBeUndefined()
  })

  it('serves the body uncompressed when zlib fails, rather than failing the response', async () => {
    gzipFails = true

    const response = await middleware.handle(eventAccepting('gzip'), nextReturning(httpResponse(LARGE)))

    expect(response.getHeader('Content-Encoding')).toBeUndefined()
    expect(response.content).toBe(LARGE)
  })

  it('leaves a response that is not going over HTTP untouched', async () => {
    // The regression this guard exists for. The middleware is global, so in an application that
    // renders rather than serves, what comes back is a browser or native response: it has no headers
    // to set, because nothing is going over a wire. Reaching for `setHeader` there threw
    // `response.removeHeader is not a function`, and only above 1 kB, so a small page worked and a
    // real one did not.
    const rendered = OutgoingResponse.create({ content: LARGE, statusCode: 200 })

    const response = await middleware.handle(eventAccepting('gzip'), nextReturning(rendered))

    expect(response).toBe(rendered as any)
    expect(response.content).toBe(LARGE)
  })
})
