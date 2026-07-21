import { eventBusBlueprint } from '../options/EventBusBlueprint'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType, SERVICE_KEY, setMetadata } from '@stone-js/core'

/**
 * Options for the `@BusHandler` decorator.
 */
export interface BusHandlerOptions {
  /** The method that processes the event (defaults to `handle`). */
  action?: string
}

/**
 * Class decorator: mark a class as a bus-event handler.
 *
 * The class is registered as a container service and contributed to `stone.eventBus.handlers`; the
 * {@link EventBusServiceProvider} resolves it (with dependency injection). With a `name`, events of
 * that name route to `handle(payload, event)`. Without a `name`, the class carries one or more
 * `@OnBusEvent('...')` methods, one event per method.
 *
 * @param name - The event name this class handles (omit when using `@OnBusEvent` methods).
 * @param options - The action method for the whole-class form (defaults to `handle`).
 * @returns A class decorator.
 *
 * @example
 * ```typescript
 * @BusHandler()
 * export class Orders {
 *   @OnBusEvent('order.shipped') onShipped (payload) { ... }
 * }
 * ```
 */
export const BusHandler = <T extends ClassType = ClassType>(name?: string, options: BusHandlerOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    setMetadata(context, SERVICE_KEY, { singleton: true, isClass: true })
    addBlueprint(target, context, eventBusBlueprint, {
      stone: {
        eventBus: {
          handlers: [{ name, module: target, isClass: true, action: options.action ?? 'handle' }]
        }
      }
    })
  })
}
