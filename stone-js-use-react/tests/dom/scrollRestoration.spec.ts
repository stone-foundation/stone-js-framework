import { setupScrollRestoration } from '../../src/dom/scrollRestoration'
import { NAVIGATION_EVENT } from '@stone-js/router'

const makeWindow = (over: any = {}): any => {
  const handlers: Record<string, Function> = {}
  return {
    handlers,
    scrollX: 10,
    scrollY: 20,
    scrollTo: vi.fn(),
    requestAnimationFrame: (cb: () => void) => { cb(); return 1 },
    history: { state: over.state ?? null, scrollRestoration: 'auto' },
    location: { hash: over.hash ?? '', href: over.href ?? 'http://x/a' },
    document: { getElementById: vi.fn(() => over.element ?? null) },
    addEventListener: (name: string, fn: Function) => { handlers[name] = fn },
    removeEventListener: vi.fn()
  }
}

describe('setupScrollRestoration', () => {
  it('is a no-op when disabled', () => {
    const win = makeWindow()
    const stop = setupScrollRestoration({ enabled: false, win })
    expect(win.handlers.scroll).toBeUndefined()
    expect(stop).toBeTypeOf('function')
    stop()
  })

  it('is a no-op when there is no window', () => {
    vi.stubGlobal('window', undefined)
    expect(() => setupScrollRestoration()()).not.toThrow()
    vi.unstubAllGlobals()
  })

  it('takes manual control and registers listeners', () => {
    const win = makeWindow()
    setupScrollRestoration({ win })
    expect(win.history.scrollRestoration).toBe('manual')
    expect(win.handlers.scroll).toBeTypeOf('function')
    expect(win.handlers.popstate).toBeTypeOf('function')
    expect(win.handlers[NAVIGATION_EVENT]).toBeTypeOf('function')
  })

  it('remembers scroll, restores it on back/forward, tops-out unknown entries', () => {
    const win = makeWindow({ href: 'http://x/a' })
    setupScrollRestoration({ win })

    win.handlers.scroll() // remember [10,20] for /a
    win.location.href = 'http://x/b'
    win.handlers.popstate() // unknown -> top
    expect(win.scrollTo).toHaveBeenLastCalledWith(0, 0)

    win.location.href = 'http://x/a'
    win.handlers.popstate() // known -> restore
    expect(win.scrollTo).toHaveBeenLastCalledWith(10, 20)
  })

  it('scrolls to top on a forward navigation without a hash', () => {
    const win = makeWindow()
    setupScrollRestoration({ win })
    win.handlers[NAVIGATION_EVENT]()
    expect(win.scrollTo).toHaveBeenCalledWith(0, 0)
  })

  it('scrolls to the hash target on a forward navigation', () => {
    const element = { scrollIntoView: vi.fn() }
    const win = makeWindow({ hash: '#section', element })
    setupScrollRestoration({ win })
    win.handlers[NAVIGATION_EVENT]()
    expect(win.document.getElementById).toHaveBeenCalledWith('section')
    expect(element.scrollIntoView).toHaveBeenCalled()
  })

  it('uses the history state path as key when present', () => {
    const win = makeWindow({ state: { path: '/from-state' } })
    setupScrollRestoration({ win })
    win.handlers.scroll()
    win.handlers.popstate() // same key -> restore [10,20]
    expect(win.scrollTo).toHaveBeenLastCalledWith(10, 20)
  })

  it('removes listeners on teardown', () => {
    const win = makeWindow()
    const stop = setupScrollRestoration({ win })
    stop()
    expect(win.removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function))
    expect(win.removeEventListener).toHaveBeenCalledWith('popstate', expect.any(Function))
    expect(win.removeEventListener).toHaveBeenCalledWith(NAVIGATION_EVENT, expect.any(Function))
  })

  it('falls back to setTimeout when requestAnimationFrame is unavailable', () => {
    vi.useFakeTimers()
    const win = makeWindow()
    win.requestAnimationFrame = undefined
    setupScrollRestoration({ win })
    win.handlers[NAVIGATION_EVENT]()
    vi.runAllTimers()
    expect(win.scrollTo).toHaveBeenCalledWith(0, 0)
    vi.useRealTimers()
  })

  it('uses the global window when no window is injected', () => {
    const win = makeWindow()
    vi.stubGlobal('window', win)
    setupScrollRestoration({})
    expect(win.history.scrollRestoration).toBe('manual')
    vi.unstubAllGlobals()
  })
})
