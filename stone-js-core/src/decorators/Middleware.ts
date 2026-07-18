import { MIDDLEWARE_KEY } from './constants'
import { setClassMetadata } from './Metadata'
import { ClassType, MiddlewareOptions } from '../declarations'

/**
 * Middleware decorator to mark a class as middleware within the Stone.js framework.
 *
 * This decorator is used to customize classes as middleware, allowing them to be registered and managed
 * as part of the request/response lifecycle or other layers such as adapter, kernel, or router.
 *
 * @param options - The configuration options for the middleware, including platform, priority, singleton registration, alias, layer, and type.
 * @returns A decorator function to set metadata on the target class.
 *
 * @example
 * ```typescript
 * @Middleware({ params: ['node'], priority: 1, global: true, alias: 'MyMiddleware' })
 * class MyMiddleware {
 *   // Middleware class logic here.
 * }
 * ```
 */
export const Middleware = <T extends ClassType = ClassType>(options: MiddlewareOptions = {}): ClassDecorator => {
  return setClassMetadata<T>(MIDDLEWARE_KEY, { ...options, isClass: true })
}
