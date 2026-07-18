import { setClassMetadata } from './Metadata'
import { ADAPTER_ERROR_HANDLER_KEY } from './constants'
import { ClassType, AdapterErrorHandlerOptions } from '../declarations'

/**
 * AdapterErrorHandler decorator to set imperative configuration.
 *
 * @example
 * ```typescript
 * @AdapterErrorHandler({ error: ['Error', 'RuntimeError'] })
 * class MyClass {
 *   // ...
 * }
 * ```
 *
 * @param options - The AdapterErrorHandler options.
 * @returns A class decorator function that sets the metadata using the provided options.
 */
export const AdapterErrorHandler = <T extends ClassType = ClassType>(options: AdapterErrorHandlerOptions): ClassDecorator => {
  return setClassMetadata<T>(ADAPTER_ERROR_HANDLER_KEY, { ...options, isClass: true })
}
