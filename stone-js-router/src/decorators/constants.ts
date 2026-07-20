/**
 * Constants are defined here to prevent Circular dependency between modules
 * This pattern must be applied to all Stone libraries or third party libraries.
 */

/**
 * A unique symbol key to mark classes method member as Match action.
 */
export const MATCH_KEY: symbol = Symbol.for('Match')

/**
 * A unique symbol key to mark classes method member as Match controller.
 */
export const GROUP_KEY: symbol = Symbol.for('Group')

/**
 * A unique symbol key to mark activate the router features.
 */
export const ROUTING_KEY: symbol = Symbol.for('Routing')
