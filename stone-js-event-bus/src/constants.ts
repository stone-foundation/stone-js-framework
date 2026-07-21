/** The built-in target/connection name for in-process delivery (the container EventEmitter). */
export const LOCAL = 'local'

/** The built-in target/connection name for cloud delivery (the configured driver). */
export const CLOUD = 'cloud'

/**
 * The default incoming-event property the listener reads the routing key from.
 *
 * `detail-type` is where the EventBridge driver puts the event name on emit, so the pair round-trips
 * out of the box. It is not hard-coded: override it with `@BusListener({ source })` or a full
 * `extractor` for other buses/shapes.
 */
export const DEFAULT_KEY_SOURCE = 'detail-type'
