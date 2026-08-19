/**
 * Metadata key carrying what a handler method declared with `@Validate`.
 *
 * The module owns its key, which is what makes it independent: validation works whether or not a
 * router is in play, because the declaration lives on the handler, not on a route.
 */
export const VALIDATE_KEY = '@stone-js/validation/validate'

/**
 * Metadata key carrying the alias a schema class registered itself under.
 */
export const VALIDATION_SCHEMA_KEY = '@stone-js/validation/schema'
