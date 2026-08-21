import { Config } from '@stone-js/config'
import { ScreenStack } from './ScreenStack'
import { NativeRuntime } from './NativeRuntime'
import { STONE_SCREEN_STACK } from './constants'
import { IBlueprint, IContainer, IServiceProvider, Promiseable, type MetaServiceProvider } from '@stone-js/core'

/**
 * Options for the native service provider.
 */
export interface UseReactNativeServiceProviderOptions {
  container: IContainer
}

/**
 * Registers what a screen needs to resolve from the container.
 *
 * The screen stack is registered as an alias rather than created here: it was built during
 * the build phase, before any event, so the middleware, the runtime and the components share
 * one object. The snapshot starts empty on every launch, because a device has no server
 * render to carry state over from.
 */
export class UseReactNativeServiceProvider implements IServiceProvider {
  /**
   * Create the provider.
   *
   * @param container - The container to register services in.
   */
  constructor (private readonly container: IContainer) {}

  /**
   * Register services.
   */
  register (): Promiseable<void> {
    this.registerScreenStack()
    this.registerSnapshot()
  }

  /**
   * Boot the provider.
   */
  boot (): Promiseable<void> {
    NativeRuntime.share(this.container.make<NativeRuntime>(NativeRuntime))
  }

  /**
   * Share the stack the build phase created.
   */
  private registerScreenStack (): void {
    const blueprint = this.container.make<IBlueprint>('blueprint')
    const stack = blueprint.get<ScreenStack>(`stone.useReactNative.${STONE_SCREEN_STACK}`) ?? ScreenStack.create()

    this.container.instanceIf(STONE_SCREEN_STACK, stack)
    this.container.instanceIf(ScreenStack, stack)
  }

  /**
   * Register an empty snapshot.
   */
  private registerSnapshot (): void {
    this.container.singletonIf('snapshot', () => Config.create())
  }
}

/**
 * MetaUseReactNativeServiceProvider
 */
export const MetaUseReactNativeServiceProvider: MetaServiceProvider = { module: UseReactNativeServiceProvider, isClass: true }
