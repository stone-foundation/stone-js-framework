import { createKeyDecorator } from '@stone-js/router'

/** Metadata key under which `@OnBusEvent` records the (event name -> method) mappings on a class. */
export const ON_BUS_EVENT_KEY: symbol = Symbol.for('stone.eventBus.onBusEvent')

/**
 * Method decorator: mark a method as the handler for a bus event name.
 *
 * Use it on the methods of a class also decorated with `@BusHandler()`. One class can handle several
 * events, one method each. The method receives `(payload, event)`.
 *
 * @param name - The event name this method handles.
 * @returns A method decorator.
 *
 * @example
 * ```typescript
 * @BusHandler()
 * export class Orders {
 *   @OnBusEvent('order.shipped') onShipped (payload) { ... }
 *   @OnBusEvent('order.cancelled') onCancelled (payload) { ... }
 * }
 * ```
 */
export const OnBusEvent: (name: string) => MethodDecorator = createKeyDecorator(ON_BUS_EVENT_KEY)
