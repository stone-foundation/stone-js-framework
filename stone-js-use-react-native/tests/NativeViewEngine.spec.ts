import { ScreenStack } from '../src/ScreenStack'
import { NativeViewEngine } from '../src/NativeViewEngine'
import { UseReactNativeError } from '../src/errors/UseReactNativeError'

describe('NativeViewEngine', () => {
  it('creates elements', () => {
    const element: any = NativeViewEngine.createElement('view', { id: 'x' }, 'Hello')

    expect(element.type).toBe('view')
    expect(element.props.id).toBe('x')
  })

  it('creates elements with no props at all', () => {
    const element: any = NativeViewEngine.createElement('view')

    expect(element.type).toBe('view')
  })

  it('refuses to render to a string, because a device has nobody to send HTML to', () => {
    expect(() => NativeViewEngine.renderToString('anything')).toThrow(UseReactNativeError)
  })

  it('mounts by putting a screen on the stack', async () => {
    const stack = ScreenStack.create()

    await NativeViewEngine.mount('App', stack)

    expect(stack.top()?.element).toBe('App')
  })

  it('updates the screen it mounted, in place', async () => {
    const stack = ScreenStack.create()

    const root = await NativeViewEngine.mount('First', stack)
    root.update?.('Second')

    expect(stack.size()).toBe(1)
    expect(stack.top()?.element).toBe('Second')
  })

  it('pops its screen on unmount', async () => {
    const stack = ScreenStack.create()
    stack.navigate({ path: '/below', element: 'Below' })

    const root = await NativeViewEngine.mount('App', stack)
    root.unmount?.()

    expect(stack.top()?.element).toBe('Below')
  })

  it('hydrates like it mounts, because there is no server markup to adopt', async () => {
    const stack = ScreenStack.create()

    await NativeViewEngine.hydrate('App', stack)

    expect(stack.top()?.element).toBe('App')
  })
})
