import { Config } from '@stone-js/config'
import { ScreenStack } from '../src/ScreenStack'
import { NativeRuntime } from '../src/NativeRuntime'
import { IBlueprint, IContainer } from '@stone-js/core'

const makeRuntime = (blueprintValues: Record<string, any> = {}): {
  runtime: NativeRuntime
  stack: ScreenStack
  snapshot: Config
} => {
  const stack = ScreenStack.create()
  const snapshot = Config.create()
  const event: any = { fingerprint: () => 'fp', pathname: '/tasks' }
  // `resolveComponent` instantiates through the container, so the double needs the same two
  // methods the real one exposes.
  const blueprint = {
    get: vi.fn((key: string, fallback?: any) => blueprintValues[key] ?? fallback)
  } as unknown as IBlueprint
  const container = {
    make: vi.fn((key: string) => (key === 'event' ? event : key === 'blueprint' ? blueprint : undefined)),
    resolve: vi.fn((module: any) => new module())
  } as unknown as IContainer

  return {
    stack,
    snapshot,
    runtime: new NativeRuntime({ container, blueprint, snapshot, screenStack: stack })
  }
}

describe('NativeRuntime', () => {
  it('runs a handler once per event and remembers what it returned', async () => {
    const { runtime } = makeRuntime()
    const handler = vi.fn(async () => 'value')

    expect(await runtime.snapshot('key', handler)).toBe('value')
    expect(await runtime.snapshot('key', handler)).toBe('value')
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('keys what it remembers by event, so two navigations do not share it', async () => {
    const { runtime, snapshot } = makeRuntime()

    await runtime.snapshot('user', async () => 'Ada')

    expect(snapshot.get('fp.user')).toBe('Ada')
  })

  it('turns a head into the current screen title', () => {
    const { runtime, stack } = makeRuntime()
    stack.navigate({ path: '/tasks', element: 'Tasks' })

    runtime.head({ title: 'My tasks' })

    expect(stack.top()?.title).toBe('My tasks')
  })

  it('rethrows when the application declared no error page for it', async () => {
    const { runtime } = makeRuntime()

    await expect(runtime.throwError(new Error('boom'))).rejects.toThrow('boom')
  })

  it('shows the declared error page, replacing the screen rather than stacking one', async () => {
    // An error is not somewhere the user navigated to, so a back gesture must not walk
    // through it.
    class ErrorScreen {
      render (): string { return 'Something broke' }
      handle (): unknown { return { content: { reason: 'boom' }, statusCode: 503 } }
    }
    const { runtime, stack } = makeRuntime({
      'stone.useReact.errorPages.Error': { module: ErrorScreen, isClass: true }
    })
    stack.navigate({ path: '/tasks', element: 'Tasks' })

    await runtime.throwError(new Error('boom'))

    expect(stack.size()).toBe(1)
    expect(stack.top()?.path).toBe('/tasks')
    expect(stack.top()?.element).toBeTruthy()
  })

  it('falls back to the default error page when none matches the error name', async () => {
    class DefaultErrorScreen {
      render (): string { return 'Unexpected' }
    }
    const { runtime, stack } = makeRuntime({
      'stone.useReact.errorPages.default': { module: DefaultErrorScreen, isClass: true }
    })

    await runtime.throwError(new Error('boom'), 500)

    expect(stack.top()?.element).toBeTruthy()
  })
})
