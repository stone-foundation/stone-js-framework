import { createKeyDecorator } from '../keyRouterDecorators'

/** Metadata key under which `@OnKey` records the (key -> method) mappings on a class. */
export const KEY_ROUTING_KEY: symbol = Symbol.for('stone.keyRouting.onKey')

/**
 * Method decorator: mark a method as the handler for a routing key on a `@KeyHandler()` class.
 *
 * The light router (`@KeyRouting()`) dispatches an incoming event, keyed by a configurable property,
 * to the matching method. One class can answer several keys, one method each.
 *
 * @param key - The routing key this method handles.
 * @returns A method decorator.
 *
 * @example
 * ```typescript
 * @KeyHandler()
 * export class Handlers {
 *   @OnKey('order.shipped') onShipped (payload) { ... }
 * }
 * ```
 */
export const OnKey: (key: string) => MethodDecorator = createKeyDecorator(KEY_ROUTING_KEY)
