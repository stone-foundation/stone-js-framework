import { HookName } from '../declarations'
import { LIFECYCLE_HOOK_KEY } from './constants'
import { addMetadata, methodDecoratorLegacyWrapper } from './Metadata'

/**
 * Hook decorator to mark a method as a lifecycle hook
 * And automatically add it to the global lifecycle hook registry.
 *
 * @example
 * ```typescript
 * class MyClass {
 *    // ...
 *    @Hook('onStart')
 *    onStart () {}
 * }
 * ```
 *
 * @param name - The name of the lifecycle hook.
 * @returns A class decorator function that sets the metadata using the provided options.
 */
export const Hook = <T extends Function = Function>(name: HookName): MethodDecorator => {
  return methodDecoratorLegacyWrapper<T>((_target: T, context: ClassMethodDecoratorContext<T>): undefined => {
    addMetadata(context as ClassMethodDecoratorContext, LIFECYCLE_HOOK_KEY, { name, method: context.name })
  })
}
