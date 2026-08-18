import { NATIVE_PLATFORM } from './declarations'
import { NativeAdapter } from './NativeAdapter'
import { NativeErrorHandler } from './NativeErrorHandler'
import { IncomingEventMiddleware, ResponseMiddleware } from './middleware'
import { AdapterConfig, AppConfig, defaultKernelResolver, IBlueprint, StoneBlueprint } from '@stone-js/core'
import { OutgoingBrowserResponse, OutgoingBrowserResponseOptions } from '@stone-js/browser-core'

/**
 * Adapter resolver for the native proof-of-concept adapter.
 *
 * @param blueprint - The `IBlueprint` providing configuration and dependencies.
 * @returns A `NativeAdapter` instance.
 */
export const nativeAdapterResolver = (blueprint: IBlueprint): NativeAdapter => {
  return NativeAdapter.create(blueprint)
}

/**
 * Blueprint for the native proof-of-concept adapter.
 *
 * Declared as a plain meta-module and passed to `stoneApp({ modules: [...] })`:
 * being the only adapter, it is selected automatically by the core.
 */
export const nativeAdapterBlueprint: StoneBlueprint = {
  stone: {
    kernel: {
      responseResolver: (options: OutgoingBrowserResponseOptions) => {
        return OutgoingBrowserResponse.create({ ...options, statusCode: options.statusCode ?? 200 })
      }
    },
    adapters: [
      {
        current: false,
        default: true,
        variant: 'native',
        platform: NATIVE_PLATFORM,
        middleware: [
          { module: IncomingEventMiddleware, isClass: true, priority: 0 },
          { module: ResponseMiddleware, isClass: true, priority: 10 }
        ],
        resolver: nativeAdapterResolver,
        eventHandlerResolver: defaultKernelResolver,
        events: [],
        errorHandlers: {
          default: { module: NativeErrorHandler, isClass: true }
        }
      } as unknown as AdapterConfig
    ]
  } as Partial<AppConfig> as AppConfig
}
