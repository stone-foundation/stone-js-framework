import { isNotEmpty } from '@stone-js/core'
import { reactRedirectResponse, reactResponse } from '../../src/browser/UseReactResponse'
import { OutgoingBrowserResponse, RedirectBrowserResponse } from '@stone-js/browser-core'

vi.mock('@stone-js/core', () => ({
  isNotEmpty: vi.fn()
}))

vi.mock('@stone-js/browser-core', () => ({
  OutgoingBrowserResponse: {
    create: vi.fn()
  },
  RedirectBrowserResponse: {
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
    vi.mocked(RedirectBrowserResponse.create).mockReturnValue(mockRedirect)

    const result = reactResponse({ url: '/redirect' })

    expect(result).toBe(mockRedirect)
    expect(RedirectBrowserResponse.create).toHaveBeenCalledWith({ statusCode: 302, url: '/redirect' })
  })

  it('should return redirect response if options.content.redirect is present', () => {
    vi.mocked(isNotEmpty)
      .mockImplementationOnce(() => true) // isNotEmpty(options)
      .mockImplementationOnce(() => false) // isNotEmpty(options.url)
      .mockImplementationOnce(() => true) // isNotEmpty(options.content)
      .mockImplementationOnce(() => true) // isNotEmpty(options.content.redirect)

    const mockRedirect: any = { redirected: true }
    vi.mocked(RedirectBrowserResponse.create).mockReturnValue(mockRedirect)

    const result = reactResponse({ content: { redirect: '/login' } })

    expect(result).toBe(mockRedirect)
  })

  it('should return browser response if not SSR and not redirect', () => {
    vi.mocked(isNotEmpty).mockReturnValue(false)

    const mockBrowser: any = { html: '<div>Browser</div>' }
    vi.mocked(OutgoingBrowserResponse.create).mockReturnValue(mockBrowser)

    const result = reactResponse({ content: '<div>Browser</div>' })

    expect(result).toBe(mockBrowser)
    expect(OutgoingBrowserResponse.create).toHaveBeenCalled()
  })

  it('reactRedirectResponse should return RedirectBrowserResponse in browser', () => {
    const mockRedirect: any = { client: true }
    vi.mocked(RedirectBrowserResponse.create).mockReturnValue(mockRedirect)

    const result = reactRedirectResponse({ url: '/home' })

    expect(result).toBe(mockRedirect)
    expect(RedirectBrowserResponse.create).toHaveBeenCalledWith({ statusCode: 302, url: '/home' })
  })
})
