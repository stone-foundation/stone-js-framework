[**Authz**](../../README.md)

***

[Authz](../../README.md) / [casl](../README.md) / AbilityBuilder

# Class: AbilityBuilder\<T\>

Curated re-exports of the CASL essentials, so applications get one import surface from
`@stone-js/authz` and can define abilities without depending on CASL directly. Full CASL power
(conditions, field-level rules, subject detection) remains available.

## Type Parameters

### T

`T` *extends* `AnyAbility`

## Constructors

### Constructor

> **new AbilityBuilder**\<`T`\>(`AbilityType`): `AbilityBuilder`\<`T`\>

#### Parameters

##### AbilityType

`AbilityFactory`\<`T`\>

#### Returns

`AbilityBuilder`\<`T`\>

## Properties

### build

> **build**: (`options?`) => `T`

#### Parameters

##### options?

`AbilityOptionsOf`\<`T`\>

#### Returns

`T`

***

### can

> **can**: `AddRule`\<`T`\>

***

### cannot

> **cannot**: `AddRule`\<`T`\>

***

### rules

> **rules**: `DefineRule`\<`ToAbilityTypes`\<`T`\[*typeof* `ɵabilities`\]\>, `T`\[*typeof* `ɵconditions`\], `ClaimRawRule`\<`Extract`\<`ToAbilityTypes`\<`T`\[*typeof* `ɵabilities`\]\>, `string`\>\>\>[]
