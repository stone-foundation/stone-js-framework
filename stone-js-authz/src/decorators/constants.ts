/**
 * Metadata key carrying what a handler method declared with `@Can`.
 *
 * The module owns its key, which is what makes it independent: a handler states what it authorizes
 * whether or not a router is in play.
 */
export const CAN_KEY = '@stone-js/authz/can'

/**
 * Metadata key carrying the alias a policy class registered itself under.
 */
export const POLICY_KEY = '@stone-js/authz/policy'
