/**
 * Class decorator: mark a class as a bus-event handler container.
 *
 * A bus-flavoured alias of the light router's `@KeyHandler`: the class is registered as a service
 * and its `@OnBusEvent` methods are wired into the `@stone-js/router` light key-router. Enable the
 * listener with `@BusListener()`.
 *
 * @example
 * ```typescript
 * @BusHandler()
 * export class Orders {
 *   @OnBusEvent('order.shipped') onShipped (payload) { ... }
 * }
 * ```
 */
export { KeyHandler as BusHandler } from '@stone-js/router'
