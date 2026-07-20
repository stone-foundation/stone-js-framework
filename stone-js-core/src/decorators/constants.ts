/**
 * Constants are defined here to prevent Circular dependency between modules
 * This pattern must be applied to all Stone libraries or third party libraries.
 */

/**
 * A unique symbol key to mark classes as the main application entry point.
 */
export const STONE_APP_KEY: symbol = Symbol.for('StoneApp')

/**
 * A unique symbol key to mark classes as middleware.
 */
export const ADAPTER_MIDDLEWARE_KEY: symbol = Symbol.for('AdapterMiddleware')

/**
 * A unique symbol key to mark classes as middleware.
 */
export const CONFIG_MIDDLEWARE_KEY: symbol = Symbol.for('ConfigMiddleware')

/**
 * A unique symbol used as a key for the configuration metadata.
 */
export const CONFIGURATION_KEY: symbol = Symbol.for('Configuration')

/**
 * A unique symbol used as a key for the error handler metadata.
 */
export const ERROR_HANDLER_KEY: symbol = Symbol.for('ErrorHandler')

/**
 * A unique symbol used as a key for the adapter error handler metadata.
 */
export const ADAPTER_ERROR_HANDLER_KEY: symbol = Symbol.for('AdapterErrorHandler')

/**
 * A unique symbol key to mark classes as listeners.
 */
export const LISTENER_KEY: symbol = Symbol.for('Listener')

/**
 * A unique symbol key to mark classes as middleware.
 */
export const MIDDLEWARE_KEY: symbol = Symbol.for('Middleware')

/**
 * A unique symbol key to mark classes as providers.
 */
export const PROVIDER_KEY: symbol = Symbol.for('Provider')

/**
 * A unique symbol key to mark classes as services.
 */
export const SERVICE_KEY: symbol = Symbol.for('Service')

/**
 * A unique symbol key to mark classes as subscribers.
 */
export const SUBSCRIBER_KEY: symbol = Symbol.for('Subscriber')

/**
 * A unique symbol key to mark classes as the blueprint container.
 */
export const BLUEPRINT_KEY: symbol = Symbol.for('blueprint')

/**
 * A unique symbol key to mark classes as lifecycle hooks.
 */
export const LIFECYCLE_HOOK_KEY: symbol = Symbol.for('lifeCycleHook')
