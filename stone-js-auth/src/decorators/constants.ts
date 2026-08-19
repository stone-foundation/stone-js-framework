/**
 * Metadata key carrying what a handler method declared with `@Protect`.
 *
 * The module owns its key, which is what makes it independent: a handler states what it requires
 * whether or not a router is in play.
 */
export const PROTECT_KEY = '@stone-js/auth/protect'
