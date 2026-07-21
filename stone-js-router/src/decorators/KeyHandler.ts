import { keyRoutingBlueprint } from '../options/KeyRoutingBlueprint'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType, SERVICE_KEY, setMetadata } from '@stone-js/core'

/**
 * Class decorator: mark a class as a light-router handler container.
 *
 * The class is registered as a container service and contributed to `stone.keyRouting.handlers`; the
 * {@link KeyRoutingServiceProvider} resolves it (with dependency injection) and wires its `@OnKey`
 * methods into the key-router.
 *
 * @returns A class decorator.
 *
 * @example
 * ```typescript
 * @KeyHandler()
 * export class Handlers {
 *   @OnKey('order.shipped') onShipped (payload) { ... }
 * }
 * ```
 */
export const KeyHandler = <T extends ClassType = ClassType>(): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    setMetadata(context, SERVICE_KEY, { singleton: true, isClass: true })
    addBlueprint(target, context, keyRoutingBlueprint, {
      stone: {
        keyRouting: {
          handlers: [{ module: target, isClass: true }]
        }
      }
    })
  })
}
