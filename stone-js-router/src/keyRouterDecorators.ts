import { KeyMethodHandler, KeyHandlerMeta } from './keyRouterDeclarations'
import { addMetadata, getMetadata, methodDecoratorLegacyWrapper, ClassType } from '@stone-js/core'

/**
 * Build a method decorator that marks a method as the handler for a key, under a given metadata key.
 *
 * Consuming modules use it to create their own named decorators, e.g.
 * `export const OnJob = createKeyDecorator(QUEUE_KEY)` -> `@OnJob('send-email')`. Each decorated
 * method appends `{ key, action }` to the class's metadata under `metaKey`; the module later reads
 * them with {@link collectKeyHandlers}. Purely additive: it annotates, it does not wrap the method.
 *
 * @param metaKey - The metadata key the module owns.
 * @returns A `(key) => MethodDecorator` factory.
 */
export function createKeyDecorator <T extends Function = Function> (metaKey: symbol): (key: string) => MethodDecorator {
  return (key: string): MethodDecorator => methodDecoratorLegacyWrapper<T>((_target: T, context: ClassMethodDecoratorContext<T>): undefined => {
    addMetadata(context as ClassMethodDecoratorContext, metaKey, { key, action: String(context.name) })
  })
}

/**
 * Collect the method-level key handlers a class declared under `metaKey`.
 *
 * @param Class - The handler class.
 * @param metaKey - The metadata key the decorator wrote to.
 * @returns The declared `{ key, action }` handlers (empty when none).
 */
export function collectKeyHandlers (Class: ClassType, metaKey: symbol): KeyMethodHandler[] {
  return getMetadata<ClassType, KeyMethodHandler[]>(Class, metaKey, [])
}

/**
 * Build a handler meta-module for imperative registration.
 *
 * @param key - The routing key.
 * @param module - The handler function, instance, class or factory.
 * @param options - Whether it is a class/factory and which action method to call.
 * @returns A handler meta-module.
 *
 * @example
 * ```typescript
 * defineKeyHandler('send-email', SendEmail, { isClass: true })
 * defineKeyHandler('ping', () => 'pong')
 * ```
 */
export function defineKeyHandler (
  key: string,
  module: unknown,
  options: { isClass?: boolean, isFactory?: boolean, action?: string } = {}
): KeyHandlerMeta {
  return { key, module, ...options }
}
