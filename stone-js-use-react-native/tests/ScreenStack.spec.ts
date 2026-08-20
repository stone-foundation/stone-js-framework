import { ScreenStack } from '../src/ScreenStack'

describe('ScreenStack', () => {
  let stack: ScreenStack

  beforeEach(() => { stack = ScreenStack.create() })

  it('starts empty, with nothing to display and nowhere to go back to', () => {
    expect(stack.all()).toEqual([])
    expect(stack.top()).toBeUndefined()
    expect(stack.size()).toBe(0)
    expect(stack.canGoBack()).toBe(false)
  })

  it('pushes a screen and puts it on top', () => {
    stack.navigate({ path: '/tasks', element: 'Tasks' })

    expect(stack.size()).toBe(1)
    expect(stack.top()?.path).toBe('/tasks')
    expect(stack.top()?.element).toBe('Tasks')
  })

  it('stacks screens so a back gesture has somewhere to go', () => {
    stack.navigate({ path: '/tasks', element: 'Tasks' })
    stack.navigate({ path: '/tasks/1', element: 'Task 1' })

    expect(stack.all().map((s) => s.path)).toEqual(['/tasks', '/tasks/1'])
    expect(stack.canGoBack()).toBe(true)
  })

  it('gives every screen its own identity, even on the same path', () => {
    const first = stack.navigate({ path: '/tasks/1', element: 'a' })
    stack.navigate({ path: '/tasks/2', element: 'b' })
    const third = stack.navigate({ path: '/tasks/1', element: 'c' })

    expect(third.key).not.toBe(first.key)
  })

  it('replaces the current screen instead of stacking a duplicate of it', () => {
    // Re-resolving the route you are already on (a reload, fresh data) must not give the
    // user two identical screens to walk back through.
    stack.navigate({ path: '/tasks', element: 'Tasks' })
    stack.navigate({ path: '/tasks', element: 'Tasks, refreshed' })

    expect(stack.size()).toBe(1)
    expect(stack.top()?.element).toBe('Tasks, refreshed')
  })

  it('replaces when asked to, keeping what is underneath', () => {
    stack.navigate({ path: '/sign-in', element: 'Sign in' })
    stack.navigate({ path: '/tasks', element: 'Tasks' })
    stack.navigate({ path: '/tasks/1', element: 'Task 1' }, 'replace')

    expect(stack.all().map((s) => s.path)).toEqual(['/sign-in', '/tasks/1'])
  })

  it('resets to a single screen, leaving no history behind', () => {
    stack.navigate({ path: '/tasks', element: 'Tasks' })
    stack.navigate({ path: '/tasks/1', element: 'Task 1' })
    stack.navigate({ path: '/sign-in', element: 'Sign in' }, 'reset')

    expect(stack.all().map((s) => s.path)).toEqual(['/sign-in'])
    expect(stack.canGoBack()).toBe(false)
  })

  it('pops back one screen', () => {
    stack.navigate({ path: '/tasks', element: 'Tasks' })
    stack.navigate({ path: '/tasks/1', element: 'Task 1' })

    expect(stack.pop()?.path).toBe('/tasks')
    expect(stack.size()).toBe(1)
  })

  it('never pops the last screen, because an application always shows something', () => {
    stack.navigate({ path: '/tasks', element: 'Tasks' })

    expect(stack.pop()?.path).toBe('/tasks')
    expect(stack.size()).toBe(1)
  })

  it('tolerates a pop on an empty stack', () => {
    expect(stack.pop()).toBeUndefined()
  })

  it('titles the screen on top', () => {
    stack.navigate({ path: '/tasks', element: 'Tasks' })
    stack.setTitle('My tasks')

    expect(stack.top()?.title).toBe('My tasks')
  })

  it('ignores a title when there is no screen, or nothing to change', () => {
    stack.setTitle('Nothing')
    expect(stack.all()).toEqual([])

    const screen = stack.navigate({ path: '/tasks', element: 'Tasks', title: 'Tasks' })
    stack.setTitle('Tasks')
    stack.setTitle(undefined)

    expect(stack.top()).toBe(screen)
  })

  it('notifies subscribers of every change, and stops when they leave', () => {
    const seen: number[] = []
    const unsubscribe = stack.subscribe((screens) => seen.push(screens.length))

    stack.navigate({ path: '/a', element: 'a' })
    stack.navigate({ path: '/b', element: 'b' })
    unsubscribe()
    stack.navigate({ path: '/c', element: 'c' })

    expect(seen).toEqual([1, 2])
  })

  it('hands out a copy, so a consumer cannot mutate the stack by accident', () => {
    stack.navigate({ path: '/tasks', element: 'Tasks' })

    stack.all().push({ key: 'x', path: '/injected', element: 'x' })

    expect(stack.size()).toBe(1)
  })

  it('empties on clear', () => {
    stack.navigate({ path: '/tasks', element: 'Tasks' })
    stack.clear()

    expect(stack.all()).toEqual([])
  })
})
