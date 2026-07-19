[**Validation**](../../README.md)

***

[Validation](../../README.md) / [declarations](../README.md) / ValidationSchema

# Interface: ValidationSchema\<T\>

The engine-agnostic schema contract every validator speaks.

Any object exposing a `validate(data)` method that returns a [ValidationResult](../type-aliases/ValidationResult.md) is a
valid Stone.js schema. Zod, Valibot and ArkType schemas are adapted to this shape (they all
implement the Standard Schema spec, or expose `safeParse`), so you write the schema once and
use it identically on the backend and the frontend.

## Type Parameters

### T

`T` = `unknown`

## Properties

### validate

> **validate**: (`data`) => [`ValidationResult`](../type-aliases/ValidationResult.md)\<`T`\>

Validate a value, returning a normalised result.

#### Parameters

##### data

`unknown`

#### Returns

[`ValidationResult`](../type-aliases/ValidationResult.md)\<`T`\>
