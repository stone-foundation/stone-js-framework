import { ClassType } from '../declarations'
import { setClassMetadata } from './Metadata'
import { CONFIG_MIDDLEWARE_KEY } from './constants'

/**
 * ConfigMiddleware options.
 *
 * This interface defines the configuration options for marking a class as middleware.
 */
export interface ConfigMiddlewareOptions {
  /**
   * The params to pass to the middleware.
   */
  params?: unknown[]

  /**
   * The execution priority of the middleware.
   */
  priority?: number
}

/**
 * ConfigMiddleware decorator to mark a class as middleware within the Stone.js framework.
 *
 * This decorator is used to customize classes as middleware, allowing them to be registered and managed
 * as part of the request/response lifecycle or other layers such as adapter, kernel, or router.
 *
 * @param options - The configuration options for the middleware, including platform, priority, singleton registration, alias, layer, and type.
 * @returns A decorator function to set metadata on the target class.
 *
 * @example
 * ```typescript
 * @ConfigMiddleware({ priority: 1, singleton: true })
 * class MyMiddleware {
 *   // ConfigMiddleware class logic here.
 * }
 * ```
 */
export const ConfigMiddleware = <T extends ClassType = ClassType>(options: ConfigMiddlewareOptions = {}): ClassDecorator => {
  return setClassMetadata<T>(CONFIG_MIDDLEWARE_KEY, { ...options, isClass: true })
}
