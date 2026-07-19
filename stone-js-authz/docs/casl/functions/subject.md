[**Authz**](../../README.md)

***

[Authz](../../README.md) / [casl](../README.md) / subject

# Function: subject()

> **subject**\<`T`, `U`\>(`type`, `object`): `U` & `ForcedSubject`\<`T`\>

Curated re-exports of the CASL essentials, so applications get one import surface from
`@stone-js/authz` and can define abilities without depending on CASL directly. Full CASL power
(conditions, field-level rules, subject detection) remains available.

## Type Parameters

### T

`T` *extends* `string`

### U

`U` *extends* `Record`\<`PropertyKey`, `any`\>

## Parameters

### type

`T`

### object

`U`

## Returns

`U` & `ForcedSubject`\<`T`\>
