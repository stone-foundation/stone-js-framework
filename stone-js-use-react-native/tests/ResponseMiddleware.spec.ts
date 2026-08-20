import { IBlueprint } from '@stone-js/core'
import { ScreenStack } from '../src/ScreenStack'
import { STONE_SCREEN_STACK } from '../src/constants'
import { UseReactNativeError } from '../src/errors/UseReactNativeError'
import { NativeResponseMiddleware } from '../src/middleware/ResponseMiddleware'

const makeMiddleware = (stack?: ScreenStack): NativeResponseMiddleware => {
  const blueprint = {
    get: vi.fn((key: string) => (key === `stone.useReactNative.${STONE_SCREEN_STACK}` ? stack : undefined))
  } as unknown as IBlueprint

  return new NativeResponseMiddleware({ blueprint })
}

const makeContext = (content: any, metadata?: any): any => ({
  rawEvent: { url: '/tasks', metadata },
  incomingEvent: { pathname: '/tasks' },
  outgoingResponse: { content },
  rawResponseBuilder: {
    effects: {} as Record<string, any>,
    add (key: string, value: any) { this.effects[key] = value; return this }
  }
})

describe('NativeResponseMiddleware', () => {
  it('contributes the display as a deferred effect, not during the pipeline', async () => {
    const stack = ScreenStack.create()
    const context = makeContext({ app: 'Tasks', path: '/tasks' })

    const builder = await makeMiddleware(stack).handle(context, async () => context.rawResponseBuilder)

    // Nothing displayed yet: the adapter runs the effect once the response is final.
    expect(stack.size()).toBe(0)

    builder.effects.render()

    expect(stack.top()?.path).toBe('/tasks')
  })

  it('refuses a context missing what it needs', async () => {
    const context = makeContext({ app: 'Tasks' })
    context.outgoingResponse = undefined

    await expect(makeMiddleware(ScreenStack.create()).handle(context, async () => context.rawResponseBuilder))
      .rejects.toThrow(UseReactNativeError)
  })

  it('falls back to the page alone when no layout wrapped it', async () => {
    const stack = ScreenStack.create()
    const context = makeContext({ component: 'Bare page' })

    const builder = await makeMiddleware(stack).handle(context, async () => context.rawResponseBuilder)
    builder.effects.render()

    expect(stack.top()?.element).toBe('Bare page')
  })

  it('says so when the route was answered by something that is not a page', async () => {
    const stack = ScreenStack.create()
    const context = makeContext({ some: 'plain data' })

    const builder = await makeMiddleware(stack).handle(context, async () => context.rawResponseBuilder)

    expect(() => builder.effects.render()).toThrow(/renders pages/)
  })

  it('says so when the renderer was never enabled', async () => {
    const context = makeContext({ app: 'Tasks' })

    const builder = await makeMiddleware(undefined).handle(context, async () => context.rawResponseBuilder)

    expect(() => builder.effects.render()).toThrow(/screen stack/)
  })

  it('replaces when the navigation carried replace', async () => {
    const stack = ScreenStack.create()
    stack.navigate({ path: '/tasks', element: 'Tasks' })
    const context = makeContext({ app: 'Task 1', path: '/tasks/1' }, { replace: true })

    const builder = await makeMiddleware(stack).handle(context, async () => context.rawResponseBuilder)
    builder.effects.render()

    expect(stack.all().map((screen) => screen.path)).toEqual(['/tasks/1'])
  })

  it('honours an explicit transition over the replace flag', async () => {
    const stack = ScreenStack.create()
    stack.navigate({ path: '/tasks', element: 'Tasks' })
    const context = makeContext({ app: 'Sign in', path: '/sign-in' }, { transition: 'reset' })

    const builder = await makeMiddleware(stack).handle(context, async () => context.rawResponseBuilder)
    builder.effects.render()

    expect(stack.all().map((screen) => screen.path)).toEqual(['/sign-in'])
  })

  it('titles the screen from the resolved head', async () => {
    const stack = ScreenStack.create()
    const context = makeContext({ app: 'Tasks', path: '/tasks', head: { title: 'My tasks' } })

    const builder = await makeMiddleware(stack).handle(context, async () => context.rawResponseBuilder)
    builder.effects.render()

    expect(stack.top()?.title).toBe('My tasks')
  })

  it('falls back to the event path when the content carries none', async () => {
    const stack = ScreenStack.create()
    const context = makeContext({ app: 'Tasks' })

    const builder = await makeMiddleware(stack).handle(context, async () => context.rawResponseBuilder)
    builder.effects.render()

    expect(stack.top()?.path).toBe('/tasks')
  })

  it('says so when the response itself is empty', async () => {
    const context = makeContext({ app: 'Tasks' })
    context.outgoingResponse = {}

    const builder = await makeMiddleware(ScreenStack.create()).handle(context, async () => context.rawResponseBuilder)

    expect(() => builder.effects.render()).toThrow(/No response provided/)
  })
})
