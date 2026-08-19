import { TestAdapter } from '../TestAdapter'
import { TEST_PLATFORM } from '../declarations'
import {
  AdapterConfig,
  BlueprintContext,
  ClassType,
  defaultKernelResolver,
  IBlueprint,
  NextMiddleware,
  StoneBlueprint
} from '@stone-js/core'

/**
 * The adapter a test falls back to when the application declares none.
 *
 * A single-handler service with no platform still has to boot, so this stands in for one: its own
 * platform, the default kernel resolver, nothing else.
 */
const standaloneTestAdapter = {
  current: true,
  default: false,
  variant: 'server',
  platform: TEST_PLATFORM,
  middleware: [],
  eventHandlerResolver: defaultKernelResolver,
  errorHandlers: {}
}

/**
 * Replace the selected adapter's integration, and nothing else.
 *
 * A test is the same context as production minus the network: the same platform, the same response
 * type, the same error handlers — only the thing that talks to the outside world is swapped for an
 * in-memory one. Inventing a `test` platform instead was subtly wrong: adapters contribute much of
 * what an application is through **platform-conditional** blueprint middleware, for instance
 *
 * ```ts
 * if (blueprint.get('stone.adapter.platform') === NODE_HTTP_PLATFORM) {
 *   blueprint.set('stone.kernel.responseResolver', …)   // → OutgoingHttpResponse
 * }
 * ```
 *
 * Under a `test` platform every one of those conditions is false, so the kernel built a bare
 * `OutgoingResponse`. A JSON API survived it, because passing content through is all it needed; a
 * rendered page did not, because the view layer calls `response.isError()`. Keeping the platform
 * keeps all of it, for every context: HTTP, browser, edge, console, and whatever comes next.
 *
 * Adapter middleware is the one thing dropped. It exists to normalise a raw platform event — a
 * Node `IncomingMessage`, a Lambda payload — and a test hands over a ready `IncomingEvent`, so there
 * is nothing left for it to translate.
 *
 * Runs at priority 100, after the core selects the current adapter (0.1) and after the adapters have
 * contributed their platform-conditional configuration (6 for the Node HTTP response resolver). That
 * ordering is the whole mechanism.
 *
 * @param context - The blueprint context.
 * @param next - The next middleware.
 * @returns The blueprint.
 */
export const TakeOverCurrentAdapterMiddleware = async (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promise<IBlueprint> => {
  const current = context.blueprint.get<AdapterConfig>('stone.adapter', {} as unknown as AdapterConfig)

  context.blueprint.set('stone.adapter', {
    ...standaloneTestAdapter,
    ...current,
    middleware: [],
    resolver: (blueprint: IBlueprint) => TestAdapter.create(blueprint)
  })

  return await next(context)
}

/**
 * Ask the core to select a given platform, before it selects anything.
 *
 * An application may stack several contexts — HTTP and CLI, a browser and a server — and a test that
 * wants a specific one has to say so *before* the selection happens, so every platform-conditional
 * contribution lines up behind the same answer. This uses the core's own matching rule
 * (`adapters.find(v => v.platform === current?.platform)`) rather than a mechanism of its own.
 *
 * It also covers the case a pure SPA runs into: neither the browser nor the console adapter declares
 * itself default, so nothing is selected and there is no response contract to inherit. Naming the
 * platform is what turns that into a testable context.
 *
 * @param platform - The platform to select.
 * @returns The blueprint middleware.
 */
export const requestPlatform = (platform: string) => async (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promise<IBlueprint> => {
  context.blueprint.set('stone.adapter', {
    ...context.blueprint.get<AdapterConfig>('stone.adapter', {} as unknown as AdapterConfig),
    platform
  })

  return await next(context)
}

/**
 * Blueprint that makes an application testable in memory.
 *
 * It adds one blueprint middleware and no adapter of its own: the application's platform is kept, its
 * integration is replaced. Nothing binds a port, and nothing else about the app changes.
 */
export const testAdapterBlueprint: Partial<StoneBlueprint> = {
  stone: {
    blueprint: {
      middleware: [{ module: TakeOverCurrentAdapterMiddleware, priority: 100 }]
    }
  } as unknown as StoneBlueprint['stone']
}

/**
 * The same blueprint, for a test that names the context it wants.
 *
 * @param platform - The platform to run the app as.
 * @returns The blueprint.
 */
export const testAdapterBlueprintFor = (platform: string): Partial<StoneBlueprint> => ({
  stone: {
    blueprint: {
      middleware: [
        // Before the core selects (0.1), so the platform's own configuration follows suit.
        { module: requestPlatform(platform), priority: 0 },
        { module: TakeOverCurrentAdapterMiddleware, priority: 100 }
      ]
    }
  } as unknown as StoneBlueprint['stone']
})
