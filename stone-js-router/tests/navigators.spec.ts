import { NAVIGATION_EVENT } from '../src/constants'
import { browserNavigator } from '../src/navigators'
import { RouterError } from '../src/errors/RouterError'
import { routerBlueprint } from '../src/options/RouterBlueprint'

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

describe('the router blueprint and the navigator', () => {
  it('leaves the navigator unset, so a platform can claim it', () => {
    // The fallback lives in `Router.navigate()`, not in the blueprint, and that is the whole
    // point: pinning the browser navigator here would make "not configured" indistinguishable
    // from "configured to be the browser", and an adapter for another platform could never
    // tell whether it was free to install its own. It could not, and `navigate()` on a phone
    // threw "browser environment" instead of navigating.
    expect(routerBlueprint.stone.router?.navigator).toBeUndefined()
  })
})
