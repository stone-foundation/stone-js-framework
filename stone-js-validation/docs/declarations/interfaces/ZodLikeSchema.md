[**Validation**](../../README.md)

***

[Validation](../../README.md) / [declarations](../README.md) / ZodLikeSchema

# Interface: ZodLikeSchema\<T\>

Minimal shape of a Zod-style schema (a `safeParse` method). Kept structural so `@stone-js/validation`
never has to depend on Zod at runtime.

## Type Parameters

### T

`T` = `unknown`

## Properties

### safeParse

> **safeParse**: (`data`) => [`ZodSafeParseResult`](../type-aliases/ZodSafeParseResult.md)\<`T`\>

#### Parameters

##### data

`unknown`

#### Returns

[`ZodSafeParseResult`](../type-aliases/ZodSafeParseResult.md)\<`T`\>
