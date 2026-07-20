[**Validation**](../../README.md)

***

[Validation](../../README.md) / [Validator](../README.md) / Validator

# Class: Validator

The validation service.

Platform-agnostic: it validates any value against any supported schema (Zod, Valibot, ArkType
via Standard Schema, or a native Stone.js schema) and knows nothing about HTTP/CLI/browser.
Register it in the container (see `ValidationServiceProvider`) and resolve it as `validator`,
or use the same schema directly on the frontend — one schema, both sides.

## Implements

- [`IValidator`](../../declarations/interfaces/IValidator.md)

## Constructors

### Constructor

> **new Validator**(): `Validator`

#### Returns

`Validator`

## Methods

### assert()

> **assert**\<`T`\>(`schema`, `data`): `T`

Validate `data` and return the parsed value, or throw a [ValidationError](../../errors/ValidationError/classes/ValidationError.md) on failure.

#### Type Parameters

##### T

`T`

#### Parameters

##### schema

[`SchemaInput`](../../declarations/type-aliases/SchemaInput.md)\<`T`\>

The schema.

##### data

`unknown`

The value to validate.

#### Returns

`T`

The parsed value.

#### Throws

When validation fails.

#### Implementation of

[`IValidator`](../../declarations/interfaces/IValidator.md).[`assert`](../../declarations/interfaces/IValidator.md#assert)

***

### isValid()

> **isValid**\<`T`\>(`schema`, `data`): `boolean`

Whether `data` satisfies `schema`.

#### Type Parameters

##### T

`T`

#### Parameters

##### schema

[`SchemaInput`](../../declarations/type-aliases/SchemaInput.md)\<`T`\>

The schema.

##### data

`unknown`

The value to validate.

#### Returns

`boolean`

True when valid.

#### Implementation of

[`IValidator`](../../declarations/interfaces/IValidator.md).[`isValid`](../../declarations/interfaces/IValidator.md#isvalid)

***

### validate()

> **validate**\<`T`\>(`schema`, `data`): [`ValidationResult`](../../declarations/type-aliases/ValidationResult.md)\<`T`\>

Validate `data` against `schema`, returning a normalised result (never throws for validation
failures — inspect `success`).

#### Type Parameters

##### T

`T`

#### Parameters

##### schema

[`SchemaInput`](../../declarations/type-aliases/SchemaInput.md)\<`T`\>

The schema.

##### data

`unknown`

The value to validate.

#### Returns

[`ValidationResult`](../../declarations/type-aliases/ValidationResult.md)\<`T`\>

The validation result.

#### Implementation of

[`IValidator`](../../declarations/interfaces/IValidator.md).[`validate`](../../declarations/interfaces/IValidator.md#validate)

***

### create()

> `static` **create**(): `Validator`

Factory.

#### Returns

`Validator`

A new Validator instance.
