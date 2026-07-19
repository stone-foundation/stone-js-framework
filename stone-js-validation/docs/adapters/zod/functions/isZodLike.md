[**Validation**](../../../README.md)

***

[Validation](../../../README.md) / [adapters/zod](../README.md) / isZodLike

# Function: isZodLike()

> **isZodLike**(`value`): `value is ZodLikeSchema<unknown>`

Whether a value looks like a Zod-style schema.

## Parameters

### value

`unknown`

The value to test.

## Returns

`value is ZodLikeSchema<unknown>`

True when it exposes a `safeParse` function.
