/**
 * Metadata key carrying what a handler method declared with `@Returns`.
 *
 * The module owns its key, which is what makes it independent: a resource shapes the output whether
 * or not a router is in play, because the declaration lives on the handler, not on a route.
 */
export const RETURNS_KEY = '@stone-js/resources/returns'

/**
 * Metadata key carrying the alias a resource class registered itself under.
 */
export const API_RESOURCE_KEY = '@stone-js/resources/resource'
