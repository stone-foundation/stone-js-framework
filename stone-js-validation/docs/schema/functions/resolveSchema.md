[**Validation**](../../README.md)

***

[Validation](../../README.md) / [schema](../README.md) / resolveSchema

# Function: resolveSchema()

> **resolveSchema**\<`T`\>(`input`): [`ValidationSchema`](../../declarations/interfaces/ValidationSchema.md)\<`T`\>

Normalises any supported schema input into a Stone.js [ValidationSchema](../../declarations/interfaces/ValidationSchema.md).

Resolution order: a Standard Schema (`~standard`) is preferred (canonical, covers Zod 3.24+,
Valibot, ArkType), then a Zod-like `safeParse`, then a native Stone.js schema (`validate`).

## Type Parameters

### T

`T`

## Parameters

### input

[`SchemaInput`](../../declarations/type-aliases/SchemaInput.md)\<`T`\>

The schema to resolve.

## Returns

[`ValidationSchema`](../../declarations/interfaces/ValidationSchema.md)\<`T`\>

A Stone.js validation schema.

## Throws

When the input is not a recognisable schema.
