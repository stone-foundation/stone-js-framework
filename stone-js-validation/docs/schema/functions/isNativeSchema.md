[**Validation**](../../README.md)

***

[Validation](../../README.md) / [schema](../README.md) / isNativeSchema

# Function: isNativeSchema()

> **isNativeSchema**\<`T`\>(`value`): `value is ValidationSchema<T>`

Whether a value is already a native Stone.js [ValidationSchema](../../declarations/interfaces/ValidationSchema.md).

## Type Parameters

### T

`T`

## Parameters

### value

`unknown`

The value to test.

## Returns

`value is ValidationSchema<T>`

True when it exposes a `validate` function.
