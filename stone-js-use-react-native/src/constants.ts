/**
 * The alias the screen stack is registered under in the container.
 *
 * The stack is the seam between the framework and whatever displays the screens: resolve it
 * to drive a native navigator (see the README), or let {@link StoneNativeApp} render it.
 */
export const STONE_SCREEN_STACK = 'screenStack'

/**
 * The alias of the native runtime, deliberately the same one the web renderer uses.
 *
 * A component asking for `reactRuntime` gets the runtime of the platform it is running on,
 * which is what lets a service written once work on both.
 */
export const STONE_REACT_RUNTIME = 'reactRuntime'
