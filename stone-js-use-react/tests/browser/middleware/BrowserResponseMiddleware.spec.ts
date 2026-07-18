import { NAVIGATION_EVENT } from '@stone-js/router'
import { applyHeadToDocument } from '@stone-js/use-view'
import { STONE_PAGE_EVENT_OUTLET } from '../../../src/constants'
import { UseReactError } from '../../../src/errors/UseReactError'
import { hydrateReactApp, renderReactApp } from '../../../src/UseReactPageInternals'
import { BrowserResponseMiddleware } from '../../../src/browser/middleware/BrowserResponseMiddleware'

vi.mock('@stone-js/use-view', async mod => ({
  ...(await mod()),
  applyHeadToDocument: vi.fn()
}))

vi.mock('../../../src/UseReactPageInternals', () => ({
  hydrateReactApp: vi.fn(),
  renderReactApp: vi.fn()
}))

describe('BrowserResponseMiddleware', () => {
  const blueprint = { has: vi.fn().mockReturnValue(false) } as any
  const middleware = new BrowserResponseMiddleware({ blueprint })

  const createResponse = (content: any = {}): any => ({
    content
  }) as any

  const createContext: any = (responseContent: any = {}) => ({
    rawEvent: {},
    incomingEvent: {},
    outgoingResponse: createResponse(responseContent)
  })

  const builder = {
    add: vi.fn().mockImplementation(() => builder)
  }

  const next = vi.fn().mockResolvedValue(builder)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws if required context properties are missing', async () => {
    const invalidContext = { rawEvent: {}, incomingEvent: {} } as any
    const middleware = new BrowserResponseMiddleware({ blueprint })

    await expect(middleware.handle(invalidContext, next)).rejects.toThrow(UseReactError)
  })

  it('adds render function to builder', async () => {
    const context = createContext({ app: 'App' })
    const result = await middleware.handle(context, next)

    expect(builder.add).toHaveBeenCalledWith('render', expect.any(Function))
    expect(result).toBe(builder)
  })

  it('throws if no response is provided', async () => {
    await expect(
      // @ts-expect-error - private access
      middleware.renderComponent()
    ).rejects.toThrow('No response provided for rendering.')
  })

  it('calls handleRedirect if targetUrl is set', async () => {
    const spyPush = vi.spyOn(window.history, 'pushState').mockImplementation(() => {})
    const spyDispatch = vi.spyOn(window, 'dispatchEvent').mockImplementation(() => true)

    // @ts-expect-error - private access
    await middleware.renderComponent({ targetUrl: '/test' } as any)

    expect(spyDispatch.mock.calls[0][0].type).toBe(NAVIGATION_EVENT)
    expect(spyPush).toHaveBeenCalledWith({ path: '/test' }, '', '/test')
  })

  it('applies head context if provided', async () => {
    const head = { title: 'My Page' }
    const context = createContext({ ssr: true, app: 'App', head })

    // @ts-expect-error - private access
    await middleware.renderComponent(context.outgoingResponse)

    expect(applyHeadToDocument).toHaveBeenCalledWith(document, head)
  })

  it('hydrates app when ssr=true, not rendered, and app is present', async () => {
    const context = createContext({ ssr: true, app: 'App' })
    // @ts-expect-error - private access
    await middleware.renderComponent(context.outgoingResponse)

    expect(hydrateReactApp).toHaveBeenCalledWith('App', blueprint)
  })

  it('renders app if not yet rendered or fullRender=true', async () => {
    const blueprintWithRendered = { has: () => true }
    const mw = new BrowserResponseMiddleware({ blueprint: blueprintWithRendered } as any)

    // @ts-expect-error - private access
    await mw.renderComponent({
      content: { app: 'RenderedApp', fullRender: true }
    } as any)

    expect(renderReactApp).toHaveBeenCalledWith('RenderedApp', blueprintWithRendered)
  })

  it('dispatches component if no layout but component is set', async () => {
    const spyDispatch = vi.spyOn(window, 'dispatchEvent')

    // @ts-expect-error - private access
    await middleware.renderComponent({
      content: { component: 'LooseComponent' }
    } as any)

    expect(spyDispatch.mock.calls[0][0].type).toBe(STONE_PAGE_EVENT_OUTLET)
  })

  it('throws if content is invalid or missing everything', async () => {
    await expect(
      // @ts-expect-error - private access
      middleware.renderComponent({ content: {} } as any)
    ).rejects.toThrow('Invalid content provided for rendering.')
  })
})
