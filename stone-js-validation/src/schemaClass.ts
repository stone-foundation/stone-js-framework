import { ValidationRules } from './validateEvent'
import { RouteValidationInput, toValidationRules } from './sources'

/**
 * The contract a schema class exposes.
 *
 * One method, `rules()`, returning what to validate per source. It is deliberately declarative:
 * a contract that *describes* itself can be read by `@stone-js/openapi` to publish the request
 * schema, which a method that merely validated could never be.
 *
 * The class is resolved by the container, so its constructor receives services and `rules()` can use
 * them. That is what makes translated messages possible without a second method for them:
 *
 * ```ts
 * @ValidationSchema('createUser')
 * export class CreateUserSchema implements IValidationSchema {
 *   private readonly i18n: II18n
 *   constructor ({ i18n }: { i18n: II18n }) { this.i18n = i18n }
 *
 *   rules () {
 *     return {
 *       body: z.object({ email: z.string().email(this.i18n.t('validation.email')) })
 *     }
 *   }
 * }
 * ```
 *
 * The same class validates a form on the frontend, because nothing here knows about HTTP: resolve it
 * from the container and call `rules()`, or hand it to the `Validator` directly. One schema, both
 * sides, which is the whole reason the module is agnostic.
 */
export interface IValidationSchema {
  /** What this schema validates, per source. A bare schema is read as the body. */
  rules: () => RouteValidationInput
}

/** A class that can be resolved into an {@link IValidationSchema}. */
export type ValidationSchemaClass = new (...args: any[]) => IValidationSchema

/**
 * Whether a value is a schema class rather than a schema or a rule map.
 *
 * @param value - The candidate.
 * @returns Whether it must be resolved before use.
 */
export function isValidationSchemaClass (value: unknown): value is ValidationSchemaClass {
  return typeof value === 'function' && typeof (value as any).prototype?.rules === 'function'
}

/**
 * Whether a value is an already-built schema instance.
 *
 * @param value - The candidate.
 * @returns Whether it exposes `rules()`.
 */
export function isValidationSchema (value: unknown): value is IValidationSchema {
  return typeof value === 'object' && value !== null && typeof (value as any).rules === 'function'
}

/**
 * The imperative counterpart of a schema class: a plain function returning the rules.
 *
 * It receives the same dependencies a class would get through its constructor, so it can reach the
 * container's services too.
 *
 * @param rules - Returns what to validate, per source.
 * @returns A schema instance.
 *
 * @example
 * ```typescript
 * export const createUserSchema = defineValidationSchema(({ i18n }) => ({
 *   body: z.object({ email: z.string().email(i18n.t('validation.email')) })
 * }))
 * ```
 */
export function defineValidationSchema (
  rules: (dependencies: any) => RouteValidationInput
): (dependencies: any) => IValidationSchema {
  return (dependencies: any) => ({ rules: () => rules(dependencies) })
}

/**
 * Read the rules out of whatever a declaration resolved to.
 *
 * @param resolved - A schema instance, a schema, or a rule map.
 * @returns The rules, keyed by source.
 */
export function rulesOf (resolved: IValidationSchema | RouteValidationInput): ValidationRules {
  return toValidationRules(isValidationSchema(resolved) ? resolved.rules() : resolved)
}
