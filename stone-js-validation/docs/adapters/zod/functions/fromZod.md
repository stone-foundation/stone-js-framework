[**Validation**](../../../README.md)

***

[Validation](../../../README.md) / [adapters/zod](../README.md) / fromZod

# Function: fromZod()

> **fromZod**\<`T`\>(`schema`): [`ValidationSchema`](../../../declarations/interfaces/ValidationSchema.md)\<`T`\>

Adapts a Zod-style schema (anything exposing a synchronous `safeParse`) to the Stone.js
[ValidationSchema](../../../declarations/interfaces/ValidationSchema.md) contract. Structural — never imports Zod, so it works with any
compatible engine and keeps the module dependency-free.

## Type Parameters

### T

`T`

## Parameters

### schema

[`ZodLikeSchema`](../../../declarations/interfaces/ZodLikeSchema.md)\<`T`\>

The Zod-like schema.

## Returns

[`ValidationSchema`](../../../declarations/interfaces/ValidationSchema.md)\<`T`\>

A Stone.js validation schema.
