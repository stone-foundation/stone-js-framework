import { resolveSchema } from './schema'
import { ValidationError } from './errors/ValidationError'
import { IValidator, SchemaInput, ValidationResult } from './declarations'

/**
 * The validation service.
 *
 * Platform-agnostic: it validates any value against any supported schema (Zod, Valibot, ArkType
 * via Standard Schema, or a native Stone.js schema) and knows nothing about HTTP/CLI/browser.
 * Register it in the container (see `ValidationServiceProvider`) and resolve it as `validator`,
 * or use the same schema directly on the frontend — one schema, both sides.
 */
export class Validator implements IValidator {
  /**
   * Factory.
   *
   * @returns A new Validator instance.
   */
  static create (): Validator {
    return new this()
  }

  /**
   * Validate `data` against `schema`, returning a normalised result (never throws for validation
   * failures — inspect `success`).
   *
   * @param schema - The schema.
   * @param data - The value to validate.
   * @returns The validation result.
   */
  validate<T> (schema: SchemaInput<T>, data: unknown): ValidationResult<T> {
    return resolveSchema(schema).validate(data)
  }

  /**
   * Validate `data` and return the parsed value, or throw a {@link ValidationError} on failure.
   *
   * @param schema - The schema.
   * @param data - The value to validate.
   * @returns The parsed value.
   * @throws {ValidationError} When validation fails.
   */
  assert<T> (schema: SchemaInput<T>, data: unknown): T {
    const result = this.validate(schema, data)

    if (!result.success) {
      throw new ValidationError('The given data failed validation.', { issues: result.issues })
    }

    return result.value
  }

  /**
   * Whether `data` satisfies `schema`.
   *
   * @param schema - The schema.
   * @param data - The value to validate.
   * @returns True when valid.
   */
  isValid<T> (schema: SchemaInput<T>, data: unknown): boolean {
    return this.validate(schema, data).success
  }
}
