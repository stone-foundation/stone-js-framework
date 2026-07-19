import { Validator } from './Validator'
import { ValidationError } from './errors/ValidationError'
import { IValidator, SchemaInput, ValidationIssue } from './declarations'

/**
 * A map of event keys to the schema that validates each one.
 *
 * @example
 * ```ts
 * { email: EmailSchema, age: AgeSchema }
 * ```
 */
export type ValidationRules = Record<string, SchemaInput>

/** The minimal event shape the validator reads from — platform-agnostic. */
export interface ReadableEvent {
  get: <T>(key: string) => T | undefined
}

/**
 * Validates several event inputs at once against their schemas.
 *
 * For each `[key, schema]` it validates `event.get(key)` and collects every issue (each issue's
 * path is prefixed with its key). If any input fails, it throws a single {@link ValidationError}
 * carrying all the issues — so the caller sees the full picture, not just the first failure.
 *
 * Platform-agnostic: the event only needs a `get(key)` method, so it works for HTTP, CLI, browser
 * or any other context.
 *
 * @param event - The incoming event (anything with `get`).
 * @param rules - The validation rules.
 * @param validator - The validator to use (defaults to a fresh stateless one).
 * @throws {ValidationError} When any input fails validation.
 */
export function validateEvent (event: ReadableEvent, rules: ValidationRules, validator: IValidator = Validator.create()): void {
  const issues: ValidationIssue[] = []

  for (const [key, schema] of Object.entries(rules)) {
    const result = validator.validate(schema, event.get(key))
    if (!result.success) {
      for (const issue of result.issues) {
        issues.push({ ...issue, path: [key, ...issue.path] })
      }
    }
  }

  if (issues.length > 0) {
    throw new ValidationError('The given data failed validation.', { issues })
  }
}
