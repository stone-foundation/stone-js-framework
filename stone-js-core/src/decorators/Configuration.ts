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

  /**
   * Execution order among configurations, ascending: the lowest runs first.
   *
   * A real application has several configurations (static settings, a remote overlay, one per
   * vendable module) and some depend on values another one loads. Without an explicit order, two
   * configurations writing the same key have an undefined winner. Equal priorities keep their
   * declaration order, so unordered configurations behave exactly as before.
   *
   * Prefer the named steps of {@link ConfigurationPriority} over bare numbers.
   */
  priority?: number
}

/**
 * Named execution steps for {@link ConfigurationOptions.priority}.
 *
 * The gaps are deliberate: they leave room to slot a configuration between two steps without
 * renumbering anything.
 */
export const ConfigurationPriority = {
  /** Remote and external sources (SSM, Secrets Manager, files): everything else may depend on them. */
  Sources: 0,
  /** The application's own settings. The default. */
  App: 10,
  /** Settings contributed by a module, layered on top of the application's. */
  Module: 20
} as const

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
