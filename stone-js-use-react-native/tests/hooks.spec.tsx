import React from 'react'
import { act, render, renderHook } from '@testing-library/react'
import { ScreenStack } from '../src/ScreenStack'
import { StoneNativeApp } from '../src/components/StoneNativeApp'
import { StoneContext, StoneContextType } from '@stone-js/use-react-core'
import { useGoBack, useHead, useNavigate, useRuntime, useScreenStack, useScreens } from '../src/hooks'

const makeContext = (): { context: StoneContextType, stack: ScreenStack, services: Record<string, any> } => {
  const stack = ScreenStack.create()
  const services: Record<string, any> = {
    screenStack: stack,
    reactRuntime: { head: vi.fn() },
    router: { navigate: vi.fn() }
  }
  const context = {
    data: {},
    event: { fingerprint: () => 'fp' } as any,
    container: { make: vi.fn((key: string) => services[key]) } as any
  }

  return { context, stack, services }
}

const wrapperFor = (context: StoneContextType) => ({ children }: { children?: React.ReactNode }) => (
  <StoneContext.Provider value={context}>{children}</StoneContext.Provider>
)

describe('Native hooks', () => {
  it('useRuntime and useScreenStack resolve their aliases', () => {
    const { context, stack, services } = makeContext()
    const w = wrapperFor(context)

    expect(renderHook(() => useRuntime(), { wrapper: w }).result.current).toBe(services.reactRuntime)
    expect(renderHook(() => useScreenStack(), { wrapper: w }).result.current).toBe(stack)
  })

  it('useHead sets the screen title through the runtime', () => {
    const { context, services } = makeContext()

    renderHook(() => useHead({ title: 'My tasks' }), { wrapper: wrapperFor(context) })

    expect(services.reactRuntime.head).toHaveBeenCalledWith({ title: 'My tasks' })
  })

  it('useScreens follows the stack as it changes', () => {
    const { context, stack } = makeContext()
    const { result } = renderHook(() => useScreens(), { wrapper: wrapperFor(context) })

    expect(result.current).toEqual([])

    act(() => { stack.navigate({ path: '/tasks', element: 'Tasks' }) })

    expect(result.current.map((screen) => screen.path)).toEqual(['/tasks'])
  })

  it('useNavigate goes through the router, never straight to the stack', () => {
    const { context, services } = makeContext()
    const { result } = renderHook(() => useNavigate(), { wrapper: wrapperFor(context) })

    act(() => { result.current('/tasks') })

    expect(services.router.navigate).toHaveBeenCalledWith('/tasks', false)
  })

  it('useNavigate asks the router to replace', () => {
    const { context, services } = makeContext()
    const { result } = renderHook(() => useNavigate(), { wrapper: wrapperFor(context) })

    act(() => { result.current('/tasks', 'replace') })

    expect(services.router.navigate).toHaveBeenCalledWith('/tasks', true)
  })

  it('useNavigate empties the stack first when resetting', () => {
    const { context, stack, services } = makeContext()
    stack.navigate({ path: '/old', element: 'Old' })
    const { result } = renderHook(() => useNavigate(), { wrapper: wrapperFor(context) })

    act(() => { result.current('/sign-in', 'reset') })

    expect(stack.size()).toBe(0)
    expect(services.router.navigate).toHaveBeenCalledWith('/sign-in', false)
  })

  it('useGoBack reports whether going back stays in the application', () => {
    const { context, stack } = makeContext()
    stack.navigate({ path: '/tasks', element: 'Tasks' })
    const { result } = renderHook(() => useGoBack(), { wrapper: wrapperFor(context) })

    expect(result.current.canGoBack).toBe(false)
    expect(result.current.goBack()).toBe(false)

    act(() => { stack.navigate({ path: '/tasks/1', element: 'Task' }) })

    expect(result.current.canGoBack).toBe(true)
    act(() => { expect(result.current.goBack()).toBe(true) })
    expect(stack.top()?.path).toBe('/tasks')
  })
})

describe('StoneNativeApp', () => {
  it('shows the screen on top', () => {
    const { context, stack } = makeContext()
    stack.navigate({ path: '/tasks', element: <span>Tasks</span> })

    const { container } = render(<StoneNativeApp />, { wrapper: wrapperFor(context) })

    expect(container.textContent).toContain('Tasks')
  })

  it('shows the fallback until the first route has been resolved', () => {
    const { context } = makeContext()

    const { container } = render(<StoneNativeApp fallback={<span>Loading</span>} />, { wrapper: wrapperFor(context) })

    expect(container.textContent).toContain('Loading')
  })

  it('shows nothing at all when there is no fallback', () => {
    const { context } = makeContext()

    const { container } = render(<StoneNativeApp />, { wrapper: wrapperFor(context) })

    expect(container.textContent).toBe('')
  })
})
