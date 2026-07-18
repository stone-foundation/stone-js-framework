import { ClassType } from '../declarations'
import { setClassMetadata } from './Metadata'
import { CONFIGURATION_KEY } from './constants'

/**
 * Configuration options.
 *
 * This interface defines the configuration options for marking a class as a Configuration.
 */
export interface ConfigurationOptions {
  /**
   * Live configurations are loaded on each request.
   * By default, configurations loaded once when the application starts.
   * Usefull to define dynamic configurations.
   * No need to restart the application to apply changes.
   */
  live?: boolean
}

/**
 * Configuration decorator to set imperative configuration.
 *
 * @example
 * ```typescript
 * @Configuration()
 * MyConfiguration {
 *  configure (blueprint): void | Promise<void> {
 *    blueprint.set('name.name', {})
 *  }
 * }
 * ```
 *
 * @param options - The configuration options.
 * @returns A class decorator function that sets the metadata using the provided options.
 */
export const Configuration = <T extends ClassType = ClassType>(options: ConfigurationOptions = {}): ClassDecorator => {
  return setClassMetadata<T>(CONFIGURATION_KEY, { ...options, isClass: true })
}
