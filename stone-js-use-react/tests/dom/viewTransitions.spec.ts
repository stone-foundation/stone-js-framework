// @vitest-environment jsdom
import { renderWithTransition } from '../../src/dom/viewTransitions'

vi.mock('react-dom', () => ({ flushSync: (fn: () => void) => fn() }))

const makeRoot = (): any => ({ render: vi.fn() })

describe('renderWithTransition', () => {
  it('wraps a navigation render in a View Transition when supported', () => {
    const root = makeRoot()
    const startViewTransition = vi.fn((cb: () => void) => cb())
    renderWithTransition(root, 'app' as any, { isNavigation: true, doc: { startViewTransition } })
    expect(startViewTransition).toHaveBeenCalled()
    expect(root.render).toHaveBeenCalledWith('app')
  })

  it('renders directly on the first render (not a navigation)', () => {
    const root = makeRoot()
    const startViewTransition = vi.fn()
    renderWithTransition(root, 'app' as any, { isNavigation: false, doc: { startViewTransition } })
    expect(startViewTransition).not.toHaveBeenCalled()
    expect(root.render).toHaveBeenCalledWith('app')
  })

  it('renders directly when disabled', () => {
    const root = makeRoot()
    const startViewTransition = vi.fn()
    renderWithTransition(root, 'app' as any, { isNavigation: true, enabled: false, doc: { startViewTransition } })
    expect(startViewTransition).not.toHaveBeenCalled()
    expect(root.render).toHaveBeenCalled()
  })

  it('renders directly when the API is unsupported (default document)', () => {
    const root = makeRoot()
    renderWithTransition(root, 'app' as any, { isNavigation: true })
    expect(root.render).toHaveBeenCalledWith('app')
  })

  it('renders directly when there is no document (SSR guard)', () => {
    vi.stubGlobal('document', undefined)
    const root = makeRoot()
    renderWithTransition(root, 'app' as any, { isNavigation: true })
    expect(root.render).toHaveBeenCalledWith('app')
    vi.unstubAllGlobals()
  })
})
