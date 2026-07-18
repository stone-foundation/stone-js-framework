import { setClassMetadata } from './Metadata'
import { ERROR_HANDLER_KEY } from './constants'
import { ClassType, ErrorHandlerOptions } from '../declarations'

/**
 * ErrorHandler decorator to set imperative configuration.
 *
 * @example
 * ```typescript
 * @ErrorHandler({ error: ['Error', 'RuntimeError'] })
 * class MyClass {
 *   // ...
 * }
 * ```
 *
 * @param options - The ErrorHandler options.
 * @returns A class decorator function that sets the metadata using the provided options.
 */
export const ErrorHandler = <T extends ClassType = ClassType>(options: ErrorHandlerOptions): ClassDecorator => {
  return setClassMetadata<T>(ERROR_HANDLER_KEY, { ...options, isClass: true })
}
