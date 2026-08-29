import React from 'react'
import { render } from '@testing-library/react'
import { ScreenStack } from '../src/ScreenStack'
import { StoneNativeApp } from '../src/components/StoneNativeApp'
import { StoneContext, StoneContextType } from '@stone-js/use-react-core'
import { getCurrentScreenStack, setCurrentScreenStack } from '../src/currentStack'
import { useGoBack, useScreenStack, useScreens } from '../src/hooks'
import { renderHook } from '@testing-library/react'

/**
 * The root component, as `registerRootComponent` mounts it.
 *
 * This is the case every native application starts from and the one nothing covered: the root is
 * mounted before any event exists and outside every one that follows, so there is no container
 * there to ask for anything. Every test in this package used to supply a context, which is why a
 * component that could not work without one passed its suite and failed on a device with
 * "useStone(): no Stone context found".
 */
describe('the root component, outside every event', () => {
  const stack = ScreenStack.create()

  beforeEach(() => { setCurrentScreenStack(stack); stack.clear() })

  it('reaches the stack the build decided on, with no context above it', () => {
    stack.navigate({ path: '/', element: <span>home</span> })

    const { container } = render(<StoneNativeApp />)

    expect(container.textContent).toBe('home')
  })

  it('shows the fallback before the first route resolves', () => {
    const { container } = render(<StoneNativeApp fallback={<span>Splash</span>} />)

    expect(container.textContent).toBe('Splash')
  })

  it('follows the stack from the root, exactly as it does from a screen', () => {
    const { result } = renderHook(() => useScreens())

    expect(result.current).toHaveLength(0)
  })

  it('lets the root drive navigation back', () => {
    stack.navigate({ path: '/', element: null })
    stack.navigate({ path: '/tasks', element: null })

    const { result } = renderHook(() => useGoBack())

    expect(result.current.canGoBack).toBe(true)
  })

  it('says what is missing when nothing has booted yet', () => {
    // A component rendered before `stoneApp(...).run()`, which is a real mistake with an
    // unhelpful failure until the message names the two ways out.
    setCurrentScreenStack(undefined as any)

    expect(() => renderHook(() => useScreenStack())).toThrow(/No screen stack yet/)
  })

  it('prefers the container when there is one, because inside an event it is authoritative', () => {
    const scoped = ScreenStack.create()
    const context = {
      data: {},
      event: { fingerprint: () => 'fp' } as any,
      container: { make: vi.fn((key: string) => (key === 'screenStack' ? scoped : undefined)) } as any
    } as StoneContextType

    const { result } = renderHook(() => useScreenStack(), {
      wrapper: ({ children }: any) => <StoneContext.Provider value={context}>{children}</StoneContext.Provider>
    })

    expect(result.current).toBe(scoped)
    expect(result.current).not.toBe(getCurrentScreenStack())
  })
})
