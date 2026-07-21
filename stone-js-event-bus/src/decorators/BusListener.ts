/**
 * Class decorator: enable the listener side of the bus.
 *
 * A bus-flavoured alias of the light router's `@KeyRouting`: it installs the light key-router as the
 * kernel event handler, so incoming bus events (on any simple cloud adapter that runs the kernel:
 * AWS Lambda, GCP, Azure...) are routed to their `@OnBusEvent` handlers. The routing-key `source`
 * defaults to `detail-type` (where the EventBridge driver puts the event name); pass an `extractor`
 * for other shapes. Mutually exclusive with `@Routing()`.
 *
 * @example
 * ```typescript
 * @BusListener({ source: 'detail-type' })
 * @AwsLambda()
 * @StoneApp({ name: 'consumer' })
 * export class Application {}
 * ```
 */
export { KeyRouting as BusListener, type KeyRoutingOptions as BusListenerOptions } from '@stone-js/router'
