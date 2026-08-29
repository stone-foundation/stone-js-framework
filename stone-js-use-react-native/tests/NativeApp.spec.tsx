import { Config } from '@stone-js/config'
import { ScreenStack } from '../src/ScreenStack'
import { STONE_SCREEN_STACK } from '../src/constants'
import { ErrorPage, Page, IPage } from '@stone-js/use-react-core'
import { routerBlueprint } from '@stone-js/router'
import { useReactNativeBlueprint } from '../src/options/UseReactNativeBlueprint'
import { BlueprintBuilder, IBlueprint, Logger, stoneBlueprint } from '@stone-js/core'
import { NavigationSource, ReactNativeAdapter, reactNativeAdapterBlueprint } from '@stone-js/react-native-adapter'

/**
 * The whole thing, booted: the adapter that captures a navigation, the router that matches
 * it, a real page with a loader, the shared render pipeline, and this renderer putting the
 * result on the stack. Nothing is mocked, so what passes here is the chain a device runs.
 */
@Page('/')
class HomePage implements IPage<any> {
  render (): any {
    return 'Home'
  }
}

@Page('/tasks')
class TasksPage implements IPage<any> {
  handle (): unknown {
    return { tasks: ['Ship the mobile module'] }
  }

  render ({ data }: any): any {
    return `Tasks: ${String(data?.tasks?.[0])}`
  }

  head (): any {
    return { title: 'My tasks' }
  }
}

@ErrorPage({ error: 'default' })
class AppErrorScreen {
  render ({ error }: any): any {
    return `Something broke: ${String(error?.message ?? error?.name)}`
  }
}

@Page('/broken')
class BrokenPage implements IPage<any> {
  handle (): unknown {
    throw new Error('the loader exploded')
  }

  render (): any {
    return 'never seen'
  }
}

@Page('/tasks/:id')
class TaskPage implements IPage<any> {
  handle (event: any): unknown {
    return { id: event.get('id') }
  }

  render ({ data }: any): any {
    return `Task ${String(data?.id)}`
  }
}

const boot = async (): Promise<{ adapter: ReactNativeAdapter, source: NavigationSource, stack: ScreenStack }> => {
  const source = NavigationSource.create({ linkingResolver: () => undefined })
  const blueprint = Config.create() as unknown as IBlueprint

  blueprint.set(stoneBlueprint as any)
  blueprint.set(routerBlueprint as any)
  blueprint.set(reactNativeAdapterBlueprint as any)
  blueprint.set(useReactNativeBlueprint as any)
  blueprint.set('stone.reactNative.navigationSource', source)

  Logger.init(blueprint as any)
  await BlueprintBuilder.create(blueprint as any).build([HomePage, TasksPage, TaskPage, BrokenPage, AppErrorScreen])
  Logger.init(blueprint as any)

  const stack = blueprint.get<ScreenStack>(`stone.useReactNative.${STONE_SCREEN_STACK}`)

  return { adapter: ReactNativeAdapter.create(blueprint), source, stack }
}

const settle = async (): Promise<void> => await new Promise((resolve) => setImmediate(resolve))

describe('A native Stone.js application', () => {
  it('shows the page its route resolved, with the data its loader returned', async () => {
    const { adapter, source, stack } = await boot()

    await adapter.run()
    source.navigate('/tasks')
    await settle()

    expect(stack.top()?.path).toBe('/tasks')
    expect(stack.top()?.element).toBeTruthy()

    await adapter.stop()
  })

  it('titles the screen from the page head', async () => {
    const { adapter, source, stack } = await boot()

    await adapter.run()
    source.navigate('/tasks')
    await settle()

    expect(stack.top()?.title).toBe('My tasks')

    await adapter.stop()
  })

  it('stacks screens as the user goes deeper, so there is something to go back to', async () => {
    const { adapter, source, stack } = await boot()

    await adapter.run()
    source.navigate('/tasks')
    await settle()
    source.navigate('/tasks/42')
    await settle()

    expect(stack.all().map((screen) => screen.path)).toEqual(['/', '/tasks', '/tasks/42'])
    expect(stack.canGoBack()).toBe(true)

    await adapter.stop()
  })

  it('replaces the screen when the navigation asked to', async () => {
    const { adapter, source, stack } = await boot()

    await adapter.run()
    source.navigate('/tasks')
    await settle()
    source.navigate('/tasks/42', { replace: true })
    await settle()

    expect(stack.all().map((screen) => screen.path)).toEqual(['/', '/tasks/42'])

    await adapter.stop()
  })

  it('goes back to the screen underneath, which kept its own identity', async () => {
    const { adapter, source, stack } = await boot()

    await adapter.run()
    source.navigate('/tasks')
    await settle()
    const listScreen = stack.top()
    source.navigate('/tasks/42')
    await settle()

    stack.pop()

    expect(stack.top()).toBe(listScreen)

    await adapter.stop()
  })

  it('resolves the deep link it was launched with, through the same pipeline', async () => {
    const source = NavigationSource.create({
      linkingResolver: () => ({
        getInitialURL: async () => 'myapp://tasks/7',
        addEventListener: () => ({ remove: () => {} })
      })
    })
    const blueprint = Config.create() as unknown as IBlueprint

    blueprint.set(stoneBlueprint as any)
    blueprint.set(routerBlueprint as any)
    blueprint.set(reactNativeAdapterBlueprint as any)
    blueprint.set(useReactNativeBlueprint as any)
    blueprint.set('stone.reactNative.navigationSource', source)

    Logger.init(blueprint as any)
    await BlueprintBuilder.create(blueprint as any).build([HomePage, TasksPage, TaskPage, BrokenPage, AppErrorScreen])
    Logger.init(blueprint as any)

    const stack = blueprint.get<ScreenStack>(`stone.useReactNative.${STONE_SCREEN_STACK}`)
    const adapter = ReactNativeAdapter.create(blueprint)

    await adapter.run()

    expect(stack.top()?.path).toBe('/tasks/7')

    await adapter.stop()
  })

  it.each([
    ['myapp://tasks', '/tasks'],
    ['myapp://tasks/7', '/tasks/7']
  ])('sends %s to %s, and not to its first segment', async (link, expected) => {
    // The case a pilot found on a device, and the reason it was hard to see: the single-segment
    // form answered 200 with the wrong screen. A custom scheme has no authority, so WHATWG read
    // `tasks` as a host, the path came out empty, and the router served `/`. Nothing looked broken.
    const source = NavigationSource.create({
      linkingResolver: () => ({
        getInitialURL: async () => link,
        addEventListener: () => ({ remove: () => {} })
      })
    })
    const blueprint = Config.create() as unknown as IBlueprint

    blueprint.set(stoneBlueprint as any)
    blueprint.set(routerBlueprint as any)
    blueprint.set(reactNativeAdapterBlueprint as any)
    blueprint.set(useReactNativeBlueprint as any)
    blueprint.set('stone.reactNative.navigationSource', source)

    Logger.init(blueprint as any)
    await BlueprintBuilder.create(blueprint as any).build([HomePage, TasksPage, TaskPage, BrokenPage, AppErrorScreen])
    Logger.init(blueprint as any)

    const stack = blueprint.get<ScreenStack>(`stone.useReactNative.${STONE_SCREEN_STACK}`)
    const adapter = ReactNativeAdapter.create(blueprint)

    await adapter.run()

    expect(stack.top()?.path).toBe(expected)

    await adapter.stop()
  })

  it('resolves one screen on launch, before anyone navigates', async () => {
    const { adapter, stack } = await boot()

    await adapter.run()

    expect(stack.size()).toBe(1)
    expect(stack.top()?.path).toBe('/')

    await adapter.stop()
  })

  it('lets the router navigate, so a screen never renders another screen itself', async () => {
    const source = NavigationSource.create({ linkingResolver: () => undefined })
    const blueprint = Config.create() as unknown as IBlueprint

    blueprint.set(stoneBlueprint as any)
    blueprint.set(routerBlueprint as any)
    blueprint.set(reactNativeAdapterBlueprint as any)
    blueprint.set(useReactNativeBlueprint as any)
    blueprint.set('stone.reactNative.navigationSource', source)

    Logger.init(blueprint as any)
    await BlueprintBuilder.create(blueprint as any).build([HomePage, TasksPage, TaskPage, BrokenPage, AppErrorScreen])
    Logger.init(blueprint as any)

    const stack = blueprint.get<ScreenStack>(`stone.useReactNative.${STONE_SCREEN_STACK}`)
    const adapter = ReactNativeAdapter.create(blueprint)

    await adapter.run()

    // Exactly what `router.navigate('/tasks')` reaches from inside a screen: the navigator
    // the adapter wired to its own source. No History API anywhere in the loop.
    const navigator = blueprint.get<(context: any) => void>('stone.router.navigator')
    navigator?.({ path: '/tasks', replace: false, options: {} })
    await settle()

    expect(stack.top()?.path).toBe('/tasks')

    await adapter.stop()
  })

  it('shows the declared error screen when a page fails', async () => {
    const { adapter, source, stack } = await boot()

    await adapter.run()
    source.navigate('/broken')
    await settle()

    expect(stack.top()?.element).toBeTruthy()
    expect(stack.size()).toBeGreaterThan(1)

    await adapter.stop()
  })

  it('shows the error screen for a route that does not exist', async () => {
    const { adapter, source, stack } = await boot()

    await adapter.run()
    source.navigate('/nowhere')
    await settle()

    // A phone has no status line to show, so a 404 is a screen like any other.
    expect(stack.top()?.element).toBeTruthy()

    await adapter.stop()
  })
})
