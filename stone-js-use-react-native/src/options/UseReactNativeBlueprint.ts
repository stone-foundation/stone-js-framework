import { ScreenStack } from '../ScreenStack'
import { StoneBlueprint } from '@stone-js/core'
import { MetaNativeRuntime } from '../NativeRuntime'
import { UseReactBlueprint } from '@stone-js/use-react-core'
import { metaUseReactNativeBlueprintMiddleware } from '../middleware/BlueprintMiddleware'
import { MetaUseReactNativeServiceProvider } from '../UseReactNativeServiceProvider'

/**
 * What this renderer adds to the application configuration.
 *
 * Pages, layouts, error pages and providers are configured under `stone.useReact.*`, the
 * same keys the web renderer reads, because they are declared the same way and there is no
 * reason for a page to be declared twice. What is native lives under
 * `stone.useReactNative.*`.
 */
export interface UseReactNativeConfig {
  /**
   * The navigation stack, created during the build phase and shared with the runtime, the
   * response middleware and the components. Set it yourself only to supply your own.
   */
  screenStack?: ScreenStack
}

/**
 * Blueprint for a native Stone.js application.
 */
export interface UseReactNativeBlueprint extends UseReactBlueprint {
  stone: UseReactBlueprint['stone'] & {
    useReactNative?: UseReactNativeConfig
  }
}

/**
 * The renderer's blueprint.
 *
 * Handed to the application manifest (`@UseReactNative()` does it for you), it registers the
 * runtime, the service provider and the build-phase middleware. It carries no adapter: a
 * renderer renders, and how events reach it is `@stone-js/react-native-adapter`'s business.
 */
export const useReactNativeBlueprint: UseReactNativeBlueprint = {
  stone: {
    useReact: {},
    useReactNative: {},
    services: [MetaNativeRuntime],
    providers: [MetaUseReactNativeServiceProvider],
    blueprint: {
      middleware: metaUseReactNativeBlueprintMiddleware
    }
  } as unknown as UseReactNativeBlueprint['stone']
} as unknown as UseReactNativeBlueprint

/**
 * Alias kept for symmetry with the web renderer's internal blueprint name.
 */
export const internalUseReactNativeBlueprint: StoneBlueprint = useReactNativeBlueprint as unknown as StoneBlueprint
