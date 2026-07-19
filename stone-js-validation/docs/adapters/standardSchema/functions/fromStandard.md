[**Validation**](../../../README.md)

***

[Validation](../../../README.md) / [adapters/standardSchema](../README.md) / fromStandard

# Function: fromStandard()

> **fromStandard**\<`T`\>(`schema`): [`ValidationSchema`](../../../declarations/interfaces/ValidationSchema.md)\<`T`\>

Adapts a [Standard Schema](https://standardschema.dev) (Zod 3.24+, Valibot, ArkType, …) to the
Stone.js [ValidationSchema](../../../declarations/interfaces/ValidationSchema.md) contract. Only the synchronous path is supported here; an
async schema throws a clear [ValidationError](../../../errors/ValidationError/classes/ValidationError.md) so the misuse is obvious.

## Type Parameters

### T

`T`

## Parameters

### schema

[`StandardSchemaV1`](../../../declarations/interfaces/StandardSchemaV1.md)\<`T`\>

The Standard Schema.

## Returns

[`ValidationSchema`](../../../declarations/interfaces/ValidationSchema.md)\<`T`\>

A Stone.js validation schema.
