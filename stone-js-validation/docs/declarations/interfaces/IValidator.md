[**Validation**](../../README.md)

***

[Validation](../../README.md) / [declarations](../README.md) / IValidator

# Interface: IValidator

The telemetry-free validation service contract.

## Properties

### assert

> **assert**: \<`T`\>(`schema`, `data`) => `T`

Validate `data` and return the parsed value, or throw a `ValidationError` on failure.

#### Type Parameters

##### T

`T`

#### Parameters

##### schema

[`SchemaInput`](../type-aliases/SchemaInput.md)\<`T`\>

##### data

`unknown`

#### Returns

`T`

***

### isValid

> **isValid**: \<`T`\>(`schema`, `data`) => `boolean`

Whether `data` satisfies `schema`.

#### Type Parameters

##### T

`T`

#### Parameters

##### schema

[`SchemaInput`](../type-aliases/SchemaInput.md)\<`T`\>

##### data

`unknown`

#### Returns

`boolean`

***

### validate

> **validate**: \<`T`\>(`schema`, `data`) => [`ValidationResult`](../type-aliases/ValidationResult.md)\<`T`\>

Validate `data` against `schema`, returning a normalised result (never throws).

#### Type Parameters

##### T

`T`

#### Parameters

##### schema

[`SchemaInput`](../type-aliases/SchemaInput.md)\<`T`\>

##### data

`unknown`

#### Returns

[`ValidationResult`](../type-aliases/ValidationResult.md)\<`T`\>
