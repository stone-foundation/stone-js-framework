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
 * Which side of the exchange a schema is being described for.
 *
 * It is not cosmetic. A request schema that normalises before it judges (a trimmed handle, an
 * upper-cased country) is a transform, and a transform has no output shape to describe: asking for one
 * throws. `input` is also the honest direction for a request, which is what the caller sends, before
 * coercion and defaults, and `output` is the honest one for a response.
 */
export type SchemaDirection = 'input' | 'output'

/**
 * Whether a schema knows how to describe itself.
 *
 * Zod 4 answers yes, and so does anything else that grew the same method. Asking the schema is
 * better than knowing its internals: the external converter reads Zod 3's `_def`, and a Zod 4 schema
 * still has a `_def` while holding something else inside it, so the conversion returned `{}`. An
 * empty object is a valid JSON Schema meaning "anything", which is why nothing failed: every
 * documented body and response silently became unconstrained.
 *
 * @param value - The value to test.
 * @returns True when the schema can convert itself.
 */
export function isSelfDescribing (value: unknown): value is { toJSONSchema: (options?: unknown) => JsonSchema } {
  return typeof (value as { toJSONSchema?: unknown } | undefined)?.toJSONSchema === 'function'
}

/**
 * Converts a schema input into a JSON Schema.
 *
 * Three ways in, in order: a schema that describes itself is asked to (Zod 4 and anything like it),
 * a Zod 3 schema goes through the external converter, and a plain JSON Schema object passes through
 * untouched so any engine at all can be used.
 *
 * The document declares OpenAPI 3.0, so that dialect is requested: it is the difference between
 * `nullable: true` and a `anyOf` with a null branch, and between a document tools accept and one
 * they reject. A converter too old to know the dialect still answers, and only its `$schema` marker
 * has to go, since OpenAPI 3.0 has no place for it.
 *
 * @param schema - The schema input.
 * @returns The JSON Schema.
 */
export function toJsonSchema (schema: SchemaInput, direction: SchemaDirection = 'output'): JsonSchema {
  if (isSelfDescribing(schema)) {
    return openApiDialect(schema, direction)
  }
  if (isZodSchema(schema)) {
    return withoutDialect(zodToJsonSchema(schema as never, { target: 'openApi3', $refStrategy: 'none' }) as JsonSchema)
  }
  // A plain JSON Schema passes through, minus its draft marker: an application that converted a schema
  // itself has no way to know this document is OpenAPI 3.0, where `$schema` has no place.
  return withoutDialect(schema)
}

/**
 * Strip the draft marker an OpenAPI 3.0 document has nowhere to put.
 *
 * @param schema - A JSON Schema.
 * @returns The same schema, without `$schema`.
 */
function withoutDialect (schema: JsonSchema): JsonSchema {
  if (typeof schema !== 'object' || schema === null || !('$schema' in schema)) { return schema }
  // Copied only when there is something to remove, so a schema handed in untouched comes back
  // untouched, the same object it went in as.
  const { $schema: _dropped, ...rest } = schema as JsonSchema & { $schema?: string }
  return rest
}

/**
 * Ask a self-describing schema for the OpenAPI 3.0 dialect, and accept what it can give.
 *
 * @param schema - The schema.
 * @returns The JSON Schema.
 */
function openApiDialect (
  schema: { toJSONSchema: (options?: unknown) => JsonSchema },
  direction: SchemaDirection
): JsonSchema {
  const converted = ((): JsonSchema => {
    try {
      return schema.toJSONSchema({ target: 'openapi-3.0', io: direction })
    } catch {
      // A converter too old to know the dialect still describes the schema, which is worth far more
      // than nothing at all.
      return schema.toJSONSchema({ io: direction })
    }
  })()

  // `$schema` names a JSON Schema draft, and an OpenAPI 3.0 document has nowhere to put one.
  const { $schema: _dropped, ...rest } = converted as JsonSchema & { $schema?: string }

  return rest
}
