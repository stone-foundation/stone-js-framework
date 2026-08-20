import { NAVIGATION_EVENT } from '../src/constants'
import { browserNavigator } from '../src/navigators'
import { RouterError } from '../src/errors/RouterError'

describe('browserNavigator', () => {
  beforeEach(() => {
    global.window = {
      history: {
        pushState: vi.fn(),
        replaceState: vi.fn()
      } as any,
      dispatchEvent: vi.fn()
    } as any
    global.CustomEvent = vi.fn().mockImplementation((name, opts) => ({ name, ...opts })) as any
  })

  afterEach(() => {
    // @ts-expect-error
    delete global.window
    // @ts-expect-error
    delete global.CustomEvent
    vi.restoreAllMocks()
  })

  it('should push a history entry and announce the navigation', () => {
    browserNavigator({ path: '/home', replace: false, options: {} })

    expect(window.history.pushState).toHaveBeenCalledWith({ path: '/home' }, '', '/home')
    expect(window.dispatchEvent).toHaveBeenCalled()
    expect(global.CustomEvent).toHaveBeenCalledWith(NAVIGATION_EVENT, { detail: { path: '/home' } })
  })

  it('should replace the current entry when asked to', () => {
    browserNavigator({ path: '/replaced', replace: true, options: { name: 'home' } })

    expect(window.history.replaceState).toHaveBeenCalledWith({ name: 'home', path: '/replaced' }, '', '/replaced')
    expect(window.history.pushState).not.toHaveBeenCalled()
  })

  it('should refuse to run outside a browser', () => {
    // @ts-expect-error
    global.window = undefined

    expect(() => browserNavigator({ path: '/fail', replace: false, options: {} })).toThrow(RouterError)
  })
})
