import { NativeScreen } from '../src/declarations'
import { ScreenStack } from '../src/ScreenStack'
import { shouldPopStone } from '../src/navigation/reconcile'

/**
 * The one comparison that keeps two stacks agreeing.
 *
 * A navigator and Stone both hold a stack, and Stone's is the truth. A screen can leave the
 * navigator for two reasons and only one needs answering, so this is where the native integration is
 * either correct or subtly wrong. Tested against a real `ScreenStack` rather than hand-written
 * arrays, because the cases that matter are the ones the stack's own rules produce.
 */
describe('shouldPopStone', () => {
  const screen = (path: string): Omit<NativeScreen, 'key'> => ({ path, element: null })

  it('tells Stone when the user swiped the top screen away', () => {
    // The navigator removed it; Stone has not heard about it and still has it on top.
    const stack = ScreenStack.create()
    stack.navigate(screen('/'))
    const top = stack.navigate(screen('/tasks'))

    expect(shouldPopStone(top.key, stack.all())).toBe(true)
  })

  it('stays quiet when Stone popped the screen itself', () => {
    // `useGoBack` already popped, and the navigator is only catching up with the render it was
    // given. Popping again would eat the screen underneath.
    const stack = ScreenStack.create()
    stack.navigate(screen('/'))
    const departing = stack.navigate(screen('/tasks'))
    stack.pop()

    expect(shouldPopStone(departing.key, stack.all())).toBe(false)
  })

  it('stays quiet for a screen a reset removed', () => {
    const stack = ScreenStack.create()
    stack.navigate(screen('/'))
    const departing = stack.navigate(screen('/tasks'))
    stack.navigate(screen('/sign-in'), 'reset')

    expect(shouldPopStone(departing.key, stack.all())).toBe(false)
  })

  it('stays quiet for a screen a replace swapped out', () => {
    const stack = ScreenStack.create()
    const departing = stack.navigate(screen('/tasks'))
    stack.navigate(screen('/tasks/42'), 'replace')

    expect(shouldPopStone(departing.key, stack.all())).toBe(false)
  })

  it('tells Stone about the last screen too, and the stack refuses to empty itself', () => {
    // A back gesture on the first screen is the platform's business, and the stack already knows
    // never to leave nothing displayed. The decision here does not have to encode that as well.
    const stack = ScreenStack.create()
    const only = stack.navigate(screen('/'))

    expect(shouldPopStone(only.key, stack.all())).toBe(true)
    stack.pop()
    expect(stack.size()).toBe(1)
  })

  it('is not fooled by two screens on the same path', () => {
    // Keys are per-navigation, not per-path, which is what makes `/tasks/1` pushed twice two
    // screens a user can walk back through.
    const stack = ScreenStack.create()
    const first = stack.navigate(screen('/tasks/1'))
    stack.navigate(screen('/tasks/2'))
    const third = stack.navigate(screen('/tasks/1'))

    expect(first.key).not.toBe(third.key)
    expect(shouldPopStone(third.key, stack.all())).toBe(true)
    expect(shouldPopStone(first.key, stack.all())).toBe(false)
  })

  it('stays quiet for a screen that is not on the stack at all', () => {
    const stack = ScreenStack.create()
    stack.navigate(screen('/'))

    expect(shouldPopStone('never-existed', stack.all())).toBe(false)
  })

  it('stays quiet for an empty stack', () => {
    expect(shouldPopStone('anything', [])).toBe(false)
  })
})
