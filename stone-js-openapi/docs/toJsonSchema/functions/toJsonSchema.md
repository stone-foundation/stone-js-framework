[**OpenAPI**](../../README.md)

***

[OpenAPI](../../README.md) / [toJsonSchema](../README.md) / toJsonSchema

# Function: toJsonSchema()

> **toJsonSchema**(`schema`): [`JsonSchema`](../../declarations/type-aliases/JsonSchema.md)

Converts a schema input into a JSON Schema: Zod schemas are converted (OpenAPI 3.0 dialect,
inlined), raw JSON Schema objects pass through untouched (so any engine can be used).

## Parameters

### schema

[`SchemaInput`](../../declarations/type-aliases/SchemaInput.md)

The schema input.

## Returns

[`JsonSchema`](../../declarations/type-aliases/JsonSchema.md)

The JSON Schema.
