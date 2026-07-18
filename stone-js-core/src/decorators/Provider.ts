import { ClassType } from '../declarations'
import { PROVIDER_KEY } from './constants'
import { setClassMetadata } from './Metadata'

/**
 * Provider options.
 *
 * This interface defines the configuration options for marking a class as a provider.
 */
export interface ProviderOptions {
  /**
   * Additional configuration settings for the provider, if needed.
   */
  [key: string]: unknown
}

/**
 * Provider decorator to mark a class as a ServiceProvider and automatically bind its services to the container.
 *
 * This decorator is useful for marking classes as service providers within the Stone.js framework,
 * allowing them to manage and provide their services to the service container.
 *
 * @param options - The configuration options for the provider.
 * @returns A decorator function to set metadata on the target class.
 *
 * @example
 * ```typescript
 * @Provider({ singleton: true })
 * class MyServiceProvider {
 *   // Service provider logic here.
 * }
 * ```
 */
export const Provider = <T extends ClassType = ClassType>(options: ProviderOptions = {}): ClassDecorator => {
  return setClassMetadata<T>(PROVIDER_KEY, { ...options, isClass: true })
}
