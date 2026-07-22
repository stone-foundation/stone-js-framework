import { ValidationSchema, ValidationIssue, StandardSchemaV1 } from '../declarations'
import { ValidationError } from '../errors/ValidationError'

/**
 * Adapts a [Standard Schema](https://standardschema.dev) (Zod 3.24+, Valibot, ArkType, …) to the
 * Stone.js {@link ValidationSchema} contract. Only the synchronous path is supported here; an
 * async schema throws a clear {@link ValidationError} so the misuse is obvious.
 *
 * @param schema - The Standard Schema.
 * @returns A Stone.js validation schema.
 */
export function fromStandard<T> (schema: StandardSchemaV1<T>): ValidationSchema<T> {
  return {
    validate: (data: unknown) => {
      const result = schema['~standard'].validate(data)

      if (result instanceof Promise) {
        throw new ValidationError('Asynchronous Standard Schemas are not supported by the synchronous validator.', { issues: [] })
      }

      if (result.issues === undefined) {
        return { success: true, value: result.value as T }
      }

      const issues: ValidationIssue[] = result.issues.map((issue) => ({
        path: (issue.path ?? []).map((segment) => {
          const key = typeof segment === 'object' ? segment.key : segment
          return typeof key === 'symbol' ? String(key) : key
        }),
        message: issue.message
      }))

      return { success: false, issues }
    }
  }
}

/**
 * Whether a value implements the Standard Schema v1 contract.
 *
 * @param value - The value to test.
 * @returns True when it exposes a `~standard` v1 entry.
 */
export function isStandardSchema (value: unknown): value is StandardSchemaV1 {
  const std = (value as StandardSchemaV1 | undefined)?.['~standard']
  return std?.version === 1 && typeof std?.validate === 'function'
}
