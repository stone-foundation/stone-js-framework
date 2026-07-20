[**Resources**](../../README.md)

***

[Resources](../../README.md) / [helpers](../README.md) / applyFields

# Function: applyFields()

> **applyFields**\<`T`\>(`output`, `fields?`): `Partial`\<`T`\>

Applies a sparse fieldset to an output: strips undefined, then narrows to the requested fields
(when any were requested).

## Type Parameters

### T

`T` *extends* [`ResourceOutput`](../../declarations/type-aliases/ResourceOutput.md)

## Parameters

### output

`T`

The transformed output.

### fields?

`string`[]

The requested fields (optional).

## Returns

`Partial`\<`T`\>

The filtered output.
