import { isNotEmpty } from '@stone-js/core'
import { OutgoingHttpResponse, RedirectResponse } from '@stone-js/http-core'
import { reactResponse, reactRedirectResponse } from '../../src/server/UseReactResponse'

vi.mock('@stone-js/core', () => ({
  isNotEmpty: vi.fn()
}))

vi.mock('@stone-js/http-core', () => ({
  OutgoingHttpResponse: {
    create: vi.fn()
  },
  RedirectResponse: {
    create: vi.fn()
  }
}))

describe('reactResponse and reactRedirectResponse', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return redirect response if options.url is present', () => {
    vi.mocked(isNotEmpty)
      .mockImplementationOnce(() => true) // isNotEmpty(options)
      .mockImplementationOnce(() => true) // isNotEmpty(options.url)

    const mockRedirect: any = { redirected: true }
    vi.mocked(RedirectResponse.create).mockReturnValue(mockRedirect)

    const result = reactResponse({ url: '/redirect' })

    expect(result).toBe(mockRedirect)
    expect(RedirectResponse.create).toHaveBeenCalledWith({ statusCode: 302, url: '/redirect' })
  })

  it('should return redirect response if options.content.redirect is present', () => {
    vi.mocked(isNotEmpty)
      .mockImplementationOnce(() => true) // isNotEmpty(options)
      .mockImplementationOnce(() => false) // isNotEmpty(options.url)
      .mockImplementationOnce(() => true) // isNotEmpty(options.content)
      .mockImplementationOnce(() => true) // isNotEmpty(options.content.redirect)

    const mockRedirect: any = { redirected: true }
    vi.mocked(RedirectResponse.create).mockReturnValue(mockRedirect)

    const result = reactResponse({ content: { redirect: '/login' } })

    expect(result).toBe(mockRedirect)
  })

  it('should return http response in SSR if not redirect', () => {
    vi.mocked(isNotEmpty).mockReturnValue(false)

    const mockHttp: any = { html: '<div>SSR</div>' }
    vi.mocked(OutgoingHttpResponse.create).mockReturnValue(mockHttp)

    const result = reactResponse({ content: '<div>SSR</div>' })

    expect(result).toBe(mockHttp)
    expect(OutgoingHttpResponse.create).toHaveBeenCalled()
  })

  it('reactRedirectResponse should return RedirectResponse in SSR', () => {
    const mockRedirect: any = { server: true }
    vi.mocked(RedirectResponse.create).mockReturnValue(mockRedirect)

    const result = reactRedirectResponse({ url: '/home' })

    expect(result).toBe(mockRedirect)
    expect(RedirectResponse.create).toHaveBeenCalledWith({ statusCode: 302, url: '/home' })
  })
})
