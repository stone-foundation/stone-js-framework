import React from 'react'
import { act, render } from '@testing-library/react'
import { ScreenStack } from '../src/ScreenStack'
import { StoneContext, StoneContextType } from '@stone-js/use-react-core'

/**
 * The navigator's wiring, with `@react-navigation/native-stack` stood in for.
 *
 * The line drawn here is the same one the `react-native` stub draws elsewhere in this package: what a
 * native navigator *does* with a screen is its business, and reproducing it under jsdom would test
 * their library with ours. What is ours, and what can be wrong, is the mapping and the listener: one
 * screen per screen, keyed so state survives, titled from the page's head, and a departure reported
 * back to Stone's stack.
 *
 * The transitions and the gesture themselves need a device, and nothing here pretends otherwise.
 */
const registered: Array<{ name: string, options: any, listeners: any, children: any }> = []
let containerRendered = 0

vi.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: any) => { containerRendered++; return children }
}))

vi.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: any) => children,
    Screen: ({ name, options, listeners, children }: any) => {
      registered.push({ name, options, listeners, children })
      return null
    }
  })
}))

const { StoneNativeStack } = await import('../src/navigation/StoneNativeStack')

const harness = (): { context: StoneContextType, stack: ScreenStack } => {
  const stack = ScreenStack.create()
  const context = {
    data: {},
    event: { fingerprint: () => 'fp' } as any,
    container: { make: vi.fn((key: string) => (key === 'screenStack' ? stack : undefined)) } as any
  }

  return { context, stack }
}

const wrap = (context: StoneContextType) => ({ children }: { children?: React.ReactNode }) => (
  <StoneContext.Provider value={context}>{children}</StoneContext.Provider>
)

describe('StoneNativeStack', () => {
  beforeEach(() => {
    registered.length = 0
    containerRendered = 0
  })

  it('shows the fallback before anything has resolved', () => {
    // A navigator with no screens is a runtime error in `@react-navigation/native-stack`, not an
    // empty view, so the component must not reach it at all.
    const { context } = harness()

    const { container } = render(<StoneNativeStack fallback={<span>Loading</span>} />, { wrapper: wrap(context) })

    expect(container.textContent).toBe('Loading')
    expect(containerRendered).toBe(0)
  })

  it('registers one screen per screen, keyed and titled from the page', () => {
    const { context, stack } = harness()
    stack.navigate({ path: '/', element: null, title: 'Home' })
    const second = stack.navigate({ path: '/tasks', element: null, title: 'My tasks' })

    render(<StoneNativeStack />, { wrapper: wrap(context) })

    expect(registered).toHaveLength(2)
    expect(registered[0].options.title).toBe('Home')
    // Keyed by the screen's own identity, which is what lets a navigator keep its state as the
    // stack grows. A path would collide the moment the same route is pushed twice.
    expect(registered[1].name).toBe(second.key)
  })

  it('follows the stack as it changes', () => {
    const { context, stack } = harness()
    stack.navigate({ path: '/', element: null })

    render(<StoneNativeStack />, { wrapper: wrap(context) })
    expect(registered).toHaveLength(1)

    registered.length = 0
    act(() => { stack.navigate({ path: '/tasks', element: null }) })

    expect(registered).toHaveLength(2)
  })

  it('hands each screen its element, rather than rendering it itself', () => {
    const { context, stack } = harness()
    stack.navigate({ path: '/', element: <span>the page</span> })

    render(<StoneNativeStack />, { wrapper: wrap(context) })

    expect(render(registered[0].children()).container.textContent).toBe('the page')
  })

  it('forwards screen options untouched', () => {
    const { context, stack } = harness()
    stack.navigate({ path: '/', element: null })

    render(<StoneNativeStack screenOptions={{ headerShown: false }} />, { wrapper: wrap(context) })

    expect(registered).toHaveLength(1)
  })

  it('pops Stone when the user swipes the top screen away', () => {
    const { context, stack } = harness()
    stack.navigate({ path: '/', element: null })
    stack.navigate({ path: '/tasks', element: null })

    render(<StoneNativeStack />, { wrapper: wrap(context) })
    act(() => { registered[1].listeners.beforeRemove() })

    expect(stack.size()).toBe(1)
    expect(stack.top()?.path).toBe('/')
  })

  it('does not pop twice when Stone popped the screen itself', () => {
    // `useGoBack` pops, the navigator catches up and reports the departure. Answering it would eat
    // the screen underneath.
    const { context, stack } = harness()
    stack.navigate({ path: '/', element: null })
    stack.navigate({ path: '/tasks', element: null })

    render(<StoneNativeStack />, { wrapper: wrap(context) })
    const departing = registered[1]
    act(() => { stack.pop() })
    act(() => { departing.listeners.beforeRemove() })

    expect(stack.size()).toBe(1)
    expect(stack.top()?.path).toBe('/')
  })
})
