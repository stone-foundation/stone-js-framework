import { ValidationSchema, ValidationIssue, ZodLikeSchema } from '../declarations'

/**
 * Adapts a Zod-style schema (anything exposing a synchronous `safeParse`) to the Stone.js
 * {@link ValidationSchema} contract. Structural — never imports Zod, so it works with any
 * compatible engine and keeps the module dependency-free.
 *
 * @param schema - The Zod-like schema.
 * @returns A Stone.js validation schema.
 */
export function fromZod<T> (schema: ZodLikeSchema<T>): ValidationSchema<T> {
  return {
    validate: (data: unknown) => {
      const result = schema.safeParse(data)

      if (result.success) {
        return { success: true, value: result.data }
      }

      const issues: ValidationIssue[] = result.error.issues.map((issue) => ({
        path: issue.path.map((segment) => typeof segment === 'symbol' ? String(segment) : segment),
        message: issue.message,
        code: issue.code
      }))

      return { success: false, issues }
    }
  }
}

/**
 * Whether a value looks like a Zod-style schema.
 *
 * @param value - The value to test.
 * @returns True when it exposes a `safeParse` function.
 */
export function isZodLike (value: unknown): value is ZodLikeSchema {
  return typeof (value as ZodLikeSchema | undefined)?.safeParse === 'function'
}
