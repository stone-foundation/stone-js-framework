import { zodToJsonSchema } from 'zod-to-json-schema'
import { JsonSchema, SchemaInput, ZodLike } from './declarations'

/**
 * Whether a value is a Zod schema (structurally — no runtime dependency on Zod).
 *
 * @param value - The value to test.
 * @returns True when it looks like a Zod schema.
 */
export function isZodSchema (value: unknown): value is ZodLike {
  const candidate = value as ZodLike | undefined
  return typeof candidate?.safeParse === 'function' && candidate?._def !== undefined
}

/**
 * Converts a schema input into a JSON Schema: Zod schemas are converted (OpenAPI 3.0 dialect,
 * inlined), raw JSON Schema objects pass through untouched (so any engine can be used).
 *
 * @param schema - The schema input.
 * @returns The JSON Schema.
 */
export function toJsonSchema (schema: SchemaInput): JsonSchema {
  if (isZodSchema(schema)) {
    return zodToJsonSchema(schema as never, { target: 'openApi3', $refStrategy: 'none' }) as JsonSchema
  }
  return schema
}
