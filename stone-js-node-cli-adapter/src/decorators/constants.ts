/**
 * Constants are defined here to prevent Circular dependency between modules
 * This pattern must be applied to all Stone libraries or third party libraries.
 */

/**
 * A unique symbol key to mark classes as command.
 */
export const COMMAND_KEY = Symbol.for('Command')
