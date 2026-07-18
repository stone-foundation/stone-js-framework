import { RawHttpResponse } from '../src/declarations'
import { RawHttpResponseWrapper } from '../src/RawHttpResponseWrapper'

describe('RawHttpResponseWrapper', () => {
  let mockResponse: RawHttpResponse

  beforeEach(() => {
    // Mock the ServerResponse object
    mockResponse = {
      statusCode: 404,
      statusMessage: 'Not Found',
      body: 'Hello, world!',
      headers: { 'content-type': 'application/json' }
    }
  })

  it('should set status code and message when options are provided', () => {
    const wrapper = RawHttpResponseWrapper.create(mockResponse)

    const rawResponse = wrapper.respond()

    expect(rawResponse).toEqual(mockResponse)
    expect(rawResponse.statusCode).toBe(404)
    expect(rawResponse.statusMessage).toBe('Not Found')
  })

  it('should handle missing options gracefully', () => {
    const wrapper = RawHttpResponseWrapper.create({})

    const rawResponse = wrapper.respond()

    expect(rawResponse).not.toEqual(mockResponse)
    expect(rawResponse.statusCode).toBe(500)
    expect(rawResponse.body).toBeUndefined()
    expect(rawResponse.headers).toEqual({})
    expect(rawResponse.statusMessage).toBeUndefined()
  })

  it('emits multiple Set-Cookie via the v2 cookies[] field', () => {
    const headers = new Headers()
    headers.append('set-cookie', 'sid=1; HttpOnly')
    headers.append('set-cookie', 'csrf=2; Secure')

    const rawResponse = RawHttpResponseWrapper.create({ statusCode: 200, version: 'v2', headers }).respond()

    expect(rawResponse.cookies).toEqual(['sid=1; HttpOnly', 'csrf=2; Secure'])
    expect((rawResponse.headers as Record<string, string>)?.['set-cookie']).toBeUndefined()
    expect(rawResponse.multiValueHeaders).toBeUndefined()
  })

  it('emits multiple Set-Cookie via multiValueHeaders for v1/ALB', () => {
    const headers = new Headers()
    headers.append('set-cookie', 'sid=1')
    headers.append('set-cookie', 'csrf=2')

    const rawResponse = RawHttpResponseWrapper.create({ statusCode: 200, version: 'v1', headers }).respond()

    expect(rawResponse.multiValueHeaders?.['set-cookie']).toEqual(['sid=1', 'csrf=2'])
    expect(rawResponse.cookies).toBeUndefined()
    expect((rawResponse.headers as Record<string, string>)?.['set-cookie']).toBeUndefined()
  })

  it('leaves cookies untouched when there are none', () => {
    const rawResponse = RawHttpResponseWrapper.create({ statusCode: 204, version: 'v2', headers: { 'x-a': '1' } }).respond()
    expect(rawResponse.cookies).toBeUndefined()
    expect(rawResponse.multiValueHeaders).toBeUndefined()
  })

  it('merges Set-Cookie into pre-existing multiValueHeaders for v1/ALB', () => {
    const headers = new Headers()
    headers.append('set-cookie', 'sid=1')

    const rawResponse = RawHttpResponseWrapper.create({
      statusCode: 200,
      version: 'alb',
      headers,
      multiValueHeaders: { 'x-custom': ['a', 'b'] }
    }).respond()

    expect(rawResponse.multiValueHeaders).toEqual({ 'x-custom': ['a', 'b'], 'set-cookie': ['sid=1'] })
  })

  it('falls back to get("set-cookie") on runtimes without getSetCookie()', () => {
    const original = Headers.prototype.getSetCookie
    // Simulate an older runtime that lacks Headers.getSetCookie().
    // @ts-expect-error - deleting an optional method for the test
    delete Headers.prototype.getSetCookie

    const headers = new Headers({ 'set-cookie': 'sid=1' })
    const rawResponse = RawHttpResponseWrapper.create({ statusCode: 200, version: 'v1', headers }).respond()

    expect(rawResponse.multiValueHeaders?.['set-cookie']).toEqual(['sid=1'])
    Headers.prototype.getSetCookie = original
  })

  it('adds no cookies in fallback mode when there is no Set-Cookie', () => {
    const original = Headers.prototype.getSetCookie
    // @ts-expect-error - deleting an optional method for the test
    delete Headers.prototype.getSetCookie

    const rawResponse = RawHttpResponseWrapper.create({ statusCode: 200, version: 'v1', headers: { 'x-a': '1' } }).respond()

    expect(rawResponse.cookies).toBeUndefined()
    expect(rawResponse.multiValueHeaders).toBeUndefined()
    Headers.prototype.getSetCookie = original
  })
})
