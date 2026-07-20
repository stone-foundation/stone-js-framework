import { fromZod, isZodLike } from './adapters/zod'
import { ValidationError } from './errors/ValidationError'
import { fromStandard, isStandardSchema } from './adapters/standardSchema'
import { SchemaInput, ValidationSchema } from './declarations'

/**
 * Normalises any supported schema input into a Stone.js {@link ValidationSchema}.
 *
 * Resolution order: a Standard Schema (`~standard`) is preferred (canonical, covers Zod 3.24+,
 * Valibot, ArkType), then a Zod-like `safeParse`, then a native Stone.js schema (`validate`).
 *
 * @param input - The schema to resolve.
 * @returns A Stone.js validation schema.
 * @throws {ValidationError} When the input is not a recognisable schema.
 */
export function resolveSchema<T> (input: SchemaInput<T>): ValidationSchema<T> {
  if (isStandardSchema(input)) {
    return fromStandard(input)
  }

  if (isZodLike(input)) {
    return fromZod(input)
  }

  if (isNativeSchema<T>(input)) {
    return input
  }

  throw new ValidationError('Unrecognised validation schema: expected a Standard Schema, a Zod-like schema, or a Stone.js schema.', { issues: [] })
}

/**
 * Whether a value is already a native Stone.js {@link ValidationSchema}.
 *
 * @param value - The value to test.
 * @returns True when it exposes a `validate` function.
 */
export function isNativeSchema<T> (value: unknown): value is ValidationSchema<T> {
  return typeof (value as ValidationSchema<T> | undefined)?.validate === 'function'
}
