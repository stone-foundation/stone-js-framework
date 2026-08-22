/**
 * Metadata key `@Throttle` records a handler's declared budget under.
 *
 * A string, not a symbol, by convention: another package can then read the declaration by key without
 * importing this one, which is how the contract derivation reads what other modules declare.
 */
export const THROTTLE_KEY = '@stone-js/rate-limit/throttle'
