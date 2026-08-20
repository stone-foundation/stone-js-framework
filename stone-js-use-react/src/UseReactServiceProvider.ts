import { Config } from '@stone-js/config'
import { ReactRuntime } from './ReactRuntime'
import { IContainer, IServiceProvider, Promiseable, type MetaServiceProvider } from '@stone-js/core'
import { STONE_SNAPSHOT, isSSR } from '@stone-js/use-react-core'

/**
 * Options for configuring the use-react service provider.
 */
export interface UseReactServiceProviderOptions {
  container: IContainer
}

/**
 * Use React Service Provider.
 */
export class UseReactServiceProvider implements IServiceProvider {
  /**
   * Constructs a new `UseReactServiceProvider` instance.
   *
   * @param container - The container to register services in.
   */
  constructor (private readonly container: IContainer) {}

  /**
   * Register method for the service provider.
   */
  register (): Promiseable<void> {
    this.registerSnapshot()
  }

  /**
   * Boot method for the service provider.
   */
  boot (): Promiseable<void> {
    ReactRuntime.instance = this.container.make<ReactRuntime>(ReactRuntime)
  }

  /**
   * Register the snapshot.
   *
   * We save the snapshot on server side rendering and
   * we use it to hydrate the application on the client side.
  */
  private registerSnapshot (): void {
    const textContent = isSSR() ? '{}' : (window.document.getElementById(STONE_SNAPSHOT)?.textContent ?? '{}')
    this.container.singletonIf('snapshot', () => Config.fromJson(textContent))
  }
}

/**
 * MetaUseReactServiceProvider
 */
export const MetaUseReactServiceProvider: MetaServiceProvider = { module: UseReactServiceProvider, isClass: true }
