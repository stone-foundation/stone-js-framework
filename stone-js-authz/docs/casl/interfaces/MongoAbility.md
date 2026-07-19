[**Authz**](../../README.md)

***

[Authz](../../README.md) / [casl](../README.md) / MongoAbility

# Interface: MongoAbility\<A, C\>

Curated re-exports of the CASL essentials, so applications get one import surface from
`@stone-js/authz` and can define abilities without depending on CASL directly. Full CASL power
(conditions, field-level rules, subject detection) remains available.

## Extends

- [`PureAbility`](../classes/PureAbility.md)\<`A`, `C`\>

## Type Parameters

### A

`A` *extends* `AbilityTuple` = `AbilityTuple`

### C

`C` *extends* [`MongoQuery`](../type-aliases/MongoQuery.md) = [`MongoQuery`](../type-aliases/MongoQuery.md)

## Properties

### \[ɵabilities\]

> `readonly` **\[ɵabilities\]**: `A`

#### Inherited from

[`PureAbility`](../classes/PureAbility.md).[`[ɵabilities]`](../classes/PureAbility.md#ɵabilities)

***

### \[ɵconditions\]

> `readonly` **\[ɵconditions\]**: `C`

#### Inherited from

[`PureAbility`](../classes/PureAbility.md).[`[ɵconditions]`](../classes/PureAbility.md#ɵconditions)

## Accessors

### rules

#### Get Signature

> **get** **rules**(): `RawRuleFrom`\<`A`, `Conditions`\>[]

##### Returns

`RawRuleFrom`\<`A`, `Conditions`\>[]

#### Inherited from

[`PureAbility`](../classes/PureAbility.md).[`rules`](../classes/PureAbility.md#rules)

## Methods

### actionsFor()

> **actionsFor**(`subjectType`): `string`[]

#### Parameters

##### subjectType

`ExtractSubjectType`\<`Normalize`\<`A`\>\[`1`\]\>

#### Returns

`string`[]

#### Inherited from

[`PureAbility`](../classes/PureAbility.md).[`actionsFor`](../classes/PureAbility.md#actionsfor)

***

### can()

> **can**(...`args`): `boolean`

#### Parameters

##### args

...`AbilityParameters`\<`A`\>

#### Returns

`boolean`

#### Inherited from

[`PureAbility`](../classes/PureAbility.md).[`can`](../classes/PureAbility.md#can)

***

### cannot()

> **cannot**(...`args`): `boolean`

#### Parameters

##### args

...`AbilityParameters`\<`A`\>

#### Returns

`boolean`

#### Inherited from

[`PureAbility`](../classes/PureAbility.md).[`cannot`](../classes/PureAbility.md#cannot)

***

### detectSubjectType()

> **detectSubjectType**(`object?`): `ExtractSubjectType`\<`Normalize`\<`A`\>\[`1`\]\>

#### Parameters

##### object?

`Normalize`\<`A`\>\[`1`\]

#### Returns

`ExtractSubjectType`\<`Normalize`\<`A`\>\[`1`\]\>

#### Inherited from

[`PureAbility`](../classes/PureAbility.md).[`detectSubjectType`](../classes/PureAbility.md#detectsubjecttype)

***

### on()

> **on**\<`T`\>(`event`, `handler`): `Unsubscribe`

#### Type Parameters

##### T

`T` *extends* keyof `EventsMap`\<`this`\>

#### Parameters

##### event

`T`

##### handler

`EventsMap`\<`Public`\<`MongoAbility`\<`A`, `C`\>\>\>\[`T`\]

#### Returns

`Unsubscribe`

#### Inherited from

[`PureAbility`](../classes/PureAbility.md).[`on`](../classes/PureAbility.md#on)

***

### possibleRulesFor()

> **possibleRulesFor**(...`args`): `Rule`\<`A`, `C`\>[]

#### Parameters

##### args

...`AbilityParameters`\<`A`, `A` *extends* `AbilityTuple` ? (`action`, `subject`) => `0` : `never`\>

#### Returns

`Rule`\<`A`, `C`\>[]

#### Inherited from

[`PureAbility`](../classes/PureAbility.md).[`possibleRulesFor`](../classes/PureAbility.md#possiblerulesfor)

***

### relevantRuleFor()

> **relevantRuleFor**(...`args`): `Rule`\<`A`, `C`\> \| `null`

#### Parameters

##### args

...`AbilityParameters`\<`A`\>

#### Returns

`Rule`\<`A`, `C`\> \| `null`

#### Inherited from

[`PureAbility`](../classes/PureAbility.md).[`relevantRuleFor`](../classes/PureAbility.md#relevantrulefor)

***

### rulesFor()

> **rulesFor**(...`args`): `Rule`\<`A`, `C`\>[]

#### Parameters

##### args

...`AbilityParameters`\<`A`\>

#### Returns

`Rule`\<`A`, `C`\>[]

#### Inherited from

[`PureAbility`](../classes/PureAbility.md).[`rulesFor`](../classes/PureAbility.md#rulesfor)

***

### update()

> **update**(`rules`): `Public`\<`this`\>

#### Parameters

##### rules

`DefineRule`\<`ToAbilityTypes`\<`A`\>, `C`, `ClaimRawRule`\<`Extract`\<`ToAbilityTypes`\<`A`\>, `string`\>\>\>[]

#### Returns

`Public`\<`this`\>

#### Inherited from

[`PureAbility`](../classes/PureAbility.md).[`update`](../classes/PureAbility.md#update)
