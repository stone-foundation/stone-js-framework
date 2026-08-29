import { Config } from '@stone-js/config'
import { LinkingLike } from '../src/declarations'
import { REACT_NATIVE_PLATFORM } from '../src/constants'
import { NavigationSource } from '../src/NavigationSource'
import { ReactNativeAdapter } from '../src/ReactNativeAdapter'
import { IncomingBrowserEvent } from '@stone-js/browser-core'
import { BlueprintBuilder, IBlueprint, Logger, stoneBlueprint } from '@stone-js/core'
import { reactNativeAdapterBlueprint } from '../src/options/ReactNativeAdapterBlueprint'

/**
 * A stand-in for React Native's `Linking`, so deep links are exercised without a device.
 */
const makeLinking = (initialUrl: string | null = null): LinkingLike & { fire: (url: string) => void } => {
  let handler: ((event: { url: string }) => void) | undefined
  return {
    getInitialURL: async () => initialUrl,
    addEventListener (_type: 'url', fn: (event: { url: string }) => void) {
      handler = fn
      return { remove: () => { handler = undefined } }
    },
    fire (url: string) { handler?.({ url }) }
  }
}

/**
 * Boot a real application: the core blueprint, this adapter's blueprint, and a handler
 * standing in for the domain. Nothing is mocked but the platform's linking module, so what
 * these tests exercise is the same build pipeline, kernel and adapter a device runs. The
 * adapter is returned rather than run through `stoneApp()` only so a test can tear it down.
 */
const bootAdapter = async (options: {
  linking?: LinkingLike
  baseUrl?: string
  handler: (event: IncomingBrowserEvent) => unknown
}): Promise<{ adapter: ReactNativeAdapter, source: NavigationSource, blueprint: IBlueprint }> => {
  const linking = options.linking
  const source = NavigationSource.create({
    baseUrl: options.baseUrl,
    linkingResolver: () => linking
  })
  const blueprint = Config.create() as unknown as IBlueprint

  blueprint.set(stoneBlueprint as any)
  blueprint.set(reactNativeAdapterBlueprint as any)
  blueprint.set('stone.reactNative.navigationSource', source)
  blueprint.set('stone.kernel.eventHandler', options.handler)

  Logger.init(blueprint as any)
  await BlueprintBuilder.create(blueprint as any).build([])
  Logger.init(blueprint as any)

  return { adapter: ReactNativeAdapter.create(blueprint), source, blueprint }
}

/** Let the adapter's fire-and-forget listeners finish. */
const settle = async (): Promise<void> => await new Promise((resolve) => setImmediate(resolve))

describe('ReactNativeAdapter', () => {
  it('should resolve the base path on a normal launch, and hand the domain a real event', async () => {
    const seen: IncomingBrowserEvent[] = []
    const { adapter } = await bootAdapter({
      handler: (event) => { seen.push(event); return { content: 'ok' } }
    })

    await adapter.run()

    expect(seen).toHaveLength(1)
    expect(seen[0]).toBeInstanceOf(IncomingBrowserEvent)
    expect(seen[0].pathname).toBe('/')
    expect(seen[0].source.platform).toBe(REACT_NATIVE_PLATFORM)

    await adapter.stop()
  })

  it('should resolve the deep link the application was opened with', async () => {
    const seen: IncomingBrowserEvent[] = []
    const { adapter } = await bootAdapter({
      linking: makeLinking('myapp://tasks/42?from=push'),
      handler: (event) => { seen.push(event); return { content: 'ok' } }
    })

    await adapter.run()

    expect(seen).toHaveLength(1)
    expect(seen[0].pathname).toBe('/tasks/42')
    expect(seen[0].get('from')).toBe('push')

    await adapter.stop()
  })

  it('should answer a deep link delivered while running, and an in-app navigation, the same way', async () => {
    const paths: string[] = []
    const linking = makeLinking()
    const { adapter, source } = await bootAdapter({
      linking,
      handler: (event) => { paths.push(event.pathname); return { content: 'ok' } }
    })

    await adapter.run()
    linking.fire('myapp://from-link')
    source.navigate('/from-app')
    await settle()

    expect(paths).toEqual(['/', '/from-link', '/from-app'])

    await adapter.stop()
  })

  it('should let the router navigate through the adapter, closing the loop', async () => {
    const paths: string[] = []
    const { adapter, blueprint } = await bootAdapter({
      handler: (event) => { paths.push(event.pathname); return { content: 'ok' } }
    })

    await adapter.run()

    // This is what `router.navigate('/tasks')` reaches: the navigator the adapter wired
    // during the build phase. The kernel resolves the new path with no History API in sight.
    const navigator = blueprint.get<(context: any) => void>('stone.router.navigator')
    navigator?.({ path: '/tasks', replace: false, options: {} })
    await settle()

    expect(paths).toEqual(['/', '/tasks'])

    await adapter.stop()
  })

  it('should resolve an in-app path against a configured base URL', async () => {
    const seen: IncomingBrowserEvent[] = []
    const { adapter } = await bootAdapter({
      baseUrl: 'myapp://app',
      handler: (event) => { seen.push(event); return { content: 'ok' } }
    })

    await adapter.run()

    expect(seen[0].url.protocol).toBe('myapp:')

    await adapter.stop()
  })

  it('should run the render effect the view layer deferred, with the resolved response', async () => {
    const rendered: unknown[] = []
    // A bare value: the kernel wraps it as the response's content, with no HTTP semantics.
    const { adapter, blueprint } = await bootAdapter({ handler: () => 'page' })

    blueprint.add('stone.adapter.middleware', [{
      isClass: true,
      module: class {
        async handle (context: any, next: any): Promise<any> {
          context.rawResponseBuilder.add('render', () => {
            rendered.push(context.outgoingResponse?.content)
            return 'rendered'
          })
          return await next(context)
        }
      }
    }])

    // Rebuilt so the added middleware is picked up: the adapter reads them at construction.
    await ReactNativeAdapter.create(blueprint).run()

    expect(rendered).toEqual(['page'])

    await adapter.stop()
  })

  it('should stop listening once torn down', async () => {
    const paths: string[] = []
    const { adapter, source } = await bootAdapter({
      handler: (event) => { paths.push(event.pathname); return { content: 'ok' } }
    })

    await adapter.run()
    await adapter.stop()
    source.navigate('/after-stop')
    await settle()

    expect(paths).toEqual(['/'])
  })

  it('should tolerate being stopped before it ever ran', async () => {
    const { adapter } = await bootAdapter({ handler: () => ({ content: 'ok' }) })

    await expect(adapter.stop()).resolves.toBeUndefined()
  })

  it('should not leave two listeners answering the same intent after a reload', async () => {
    const paths: string[] = []
    const { adapter, source } = await bootAdapter({
      handler: (event) => { paths.push(event.pathname); return { content: 'ok' } }
    })

    await adapter.run()
    await adapter.run()
    source.navigate('/once')
    await settle()

    // Two launches, then a single answer: the first run's listener was torn down.
    expect(paths).toEqual(['/', '/', '/once'])

    await adapter.stop()
  })

  it('should surface a failing domain through the error handler instead of crashing', async () => {
    const { adapter } = await bootAdapter({
      handler: () => { throw new Error('domain exploded') }
    })

    await expect(adapter.run()).resolves.toBeUndefined()

    await adapter.stop()
  })
})
