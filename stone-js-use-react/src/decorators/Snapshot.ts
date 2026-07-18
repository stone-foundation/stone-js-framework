import { ReactRuntime } from '../ReactRuntime'
import { methodDecoratorLegacyWrapper } from '@stone-js/core'

/**
 * Decorator to create a snapshot of the current data.
 *
 * @param name - The name of the snapshot.
 * @returns A method decorator.
 *
 * @example
 * ```typescript
 * import { Service } from '@stone-js/core';
 * import { Snapshot } from '@stone-js/use-react';
 *
 * @Service({ alias: 'userService' })
 * class UserService {
 *   @Snapshot()
 *   showProfile() {
 *     return { name: 'John Doe' };
 *   }
 * }
 * ```
 */
export const Snapshot = <T extends Function = Function>(name?: string): MethodDecorator => {
  return methodDecoratorLegacyWrapper<T>(<TFunction>(target: T, context: ClassMethodDecoratorContext<T>): TFunction => {
    return async function (this: T, ...args: any[]): Promise<any> {
      name = name ?? `${String(Object.getPrototypeOf(this).constructor.name)}.${String(context.name)}`
      return await ReactRuntime.instance?.snapshot(name, () => (target as Function).apply(this, args))
    } as TFunction
  })
}
