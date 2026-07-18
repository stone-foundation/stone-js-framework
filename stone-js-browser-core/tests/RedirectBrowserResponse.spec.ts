import { BrowserError } from '../src/errors/BrowserError'
import { RedirectBrowserResponse } from '../src/RedirectBrowserResponse'

describe('RedirectBrowserResponse', () => {
  it('should create an instance using static create()', () => {
    const response = RedirectBrowserResponse.create({
      url: 'https://stonejs.dev',
      statusCode: 302,
      content: ''
    })
    expect(response).toBeInstanceOf(RedirectBrowserResponse)
    expect(response.statusCode).toBe(302)
    expect(response.targetUrl).toBe('https://stonejs.dev')
  })

  it('should extract targetUrl from content.redirect if url is missing', () => {
    const response = new RedirectBrowserResponse({
      content: { redirect: 'https://stonejs.dev' },
      statusCode: 302,
      // @ts-expect-error: url is empty
      url: undefined // fallback to avoid isEmpty
    })
    expect(response.targetUrl).toBe('https://stonejs.dev')
  })

  it('should extract targetUrl from content if url is missing', () => {
    const response = new RedirectBrowserResponse({
      content: 'https://stonejs.dev',
      statusCode: 302,
      // @ts-expect-error: url is empty
      url: undefined // fallback value to skip `isEmpty` check
    })
    expect(response.targetUrl).toBe('https://stonejs.dev')
  })

  it('should throw BrowserError url is empty', () => {
    expect(() => {
      // @ts-expect-error: url is empty
      RedirectBrowserResponse.to(undefined)
    }).toThrowError(BrowserError)
  })

  it('should throw BrowserError content is empty', () => {
    expect(() => {
      // @ts-expect-error: content is empty
      RedirectBrowserResponse.create({ statusCode: 302, content: '' })
    }).toThrowError(BrowserError)
  })

  it('should default to a 302 status', () => {
    expect(RedirectBrowserResponse.create({ url: '/home' }).statusCode).toBe(302)
  })

  it('should throw when the status is not a redirect code', () => {
    expect(() => RedirectBrowserResponse.create({ url: '/home', statusCode: 200 })).toThrowError(BrowserError)
  })

  it('should allow relative, hash, query, dot and URL-instance targets', () => {
    expect(RedirectBrowserResponse.to('/dashboard').targetUrl).toBe('/dashboard')
    expect(RedirectBrowserResponse.to('#section').targetUrl).toBe('#section')
    expect(RedirectBrowserResponse.to('?tab=1').targetUrl).toBe('?tab=1')
    expect(RedirectBrowserResponse.to('./relative').targetUrl).toBe('./relative')
    expect(RedirectBrowserResponse.to('https://stonejs.dev').targetUrl).toBe('https://stonejs.dev')
    const url = new URL('https://stonejs.dev/path')
    expect(RedirectBrowserResponse.to(url).targetUrl).toBe(url)
  })

  it('should reject an unsafe redirect scheme (XSS guard)', () => {
    // eslint-disable-next-line no-script-url
    expect(() => RedirectBrowserResponse.to('javascript:alert(1)')).toThrowError(BrowserError)
    expect(() => RedirectBrowserResponse.to('data:text/html,<script>')).toThrowError(BrowserError)
  })

  it('exposes its own REDIRECT_BROWSER_RESPONSE identity (no parent shadow)', () => {
    expect(RedirectBrowserResponse.REDIRECT_BROWSER_RESPONSE).toBe('stonejs@redirect_browser_response')
  })
})
