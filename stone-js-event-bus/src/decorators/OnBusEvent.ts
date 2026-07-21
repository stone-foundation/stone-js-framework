/**
 * Method decorator: mark a method as the handler for a bus event name.
 *
 * A bus-flavoured alias of the light router's `@OnKey`: incoming bus events are routed to the
 * matching method by the `@stone-js/router` light key-router (enabled by `@BusListener()`). Use it on
 * a `@BusHandler()` class; the method receives `(payload, event)`.
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
export { OnKey as OnBusEvent } from '@stone-js/router'
