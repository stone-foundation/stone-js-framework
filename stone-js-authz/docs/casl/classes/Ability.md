[**Authz**](../../README.md)

***

[Authz](../../README.md) / [casl](../README.md) / Ability

# ~~Class: Ability\<A, C\>~~

## Deprecated

use createMongoAbility function instead and MongoAbility<Abilities> interface.
In the next major version PureAbility will be renamed to Ability and this class will be removed

## Extends

- [`PureAbility`](PureAbility.md)\<`A`, `C`\>

## Type Parameters

### A

`A` *extends* `AbilityTuple` = `AbilityTuple`

### C

`C` *extends* [`MongoQuery`](../type-aliases/MongoQuery.md) = [`MongoQuery`](../type-aliases/MongoQuery.md)

## Constructors

### Constructor

> **new Ability**\<`A`, `C`\>(`rules?`, `options?`): `Ability`\<`A`, `C`\>

#### Parameters

##### rules?

`RawRuleFrom`\<`A`, `C`\>[]

##### options?

`AbilityOptions`\<`A`, `C`\>

#### Returns

`Ability`\<`A`, `C`\>

#### Overrides

[`PureAbility`](PureAbility.md).[`constructor`](PureAbility.md#constructor)

## Properties

### ~~\[ɵabilities\]~~

> `readonly` **\[ɵabilities\]**: `A`

#### Inherited from

[`PureAbility`](PureAbility.md).[`[ɵabilities]`](PureAbility.md#ɵabilities)

***

### ~~\[ɵconditions\]~~

> `readonly` **\[ɵconditions\]**: `C`

#### Inherited from

[`PureAbility`](PureAbility.md).[`[ɵconditions]`](PureAbility.md#ɵconditions)

## Accessors

### ~~rules~~

#### Get Signature

> **get** **rules**(): `RawRuleFrom`\<`A`, `Conditions`\>[]

##### Returns

`RawRuleFrom`\<`A`, `Conditions`\>[]

#### Inherited from

[`PureAbility`](PureAbility.md).[`rules`](PureAbility.md#rules)

## Methods

### ~~actionsFor()~~

> **actionsFor**(`subjectType`): `string`[]

#### Parameters

##### subjectType

`ExtractSubjectType`\<`Normalize`\<`A`\>\[`1`\]\>

#### Returns

`string`[]

#### Inherited from

[`PureAbility`](PureAbility.md).[`actionsFor`](PureAbility.md#actionsfor)

***

### ~~can()~~

> **can**(...`args`): `boolean`

#### Parameters

##### args

...`AbilityParameters`\<`A`\>

#### Returns

`boolean`

#### Inherited from

[`PureAbility`](PureAbility.md).[`can`](PureAbility.md#can)

***

### ~~cannot()~~

> **cannot**(...`args`): `boolean`

#### Parameters

##### args

...`AbilityParameters`\<`A`\>

#### Returns

`boolean`

#### Inherited from

[`PureAbility`](PureAbility.md).[`cannot`](PureAbility.md#cannot)

***

### ~~detectSubjectType()~~

> **detectSubjectType**(`object?`): `ExtractSubjectType`\<`Normalize`\<`A`\>\[`1`\]\>

#### Parameters

##### object?

`Normalize`\<`A`\>\[`1`\]

#### Returns

`ExtractSubjectType`\<`Normalize`\<`A`\>\[`1`\]\>

#### Inherited from

[`PureAbility`](PureAbility.md).[`detectSubjectType`](PureAbility.md#detectsubjecttype)

***

### ~~on()~~

> **on**\<`T`\>(`event`, `handler`): `Unsubscribe`

#### Type Parameters

##### T

`T` *extends* keyof `EventsMap`\<`this`\>

#### Parameters

##### event

`T`

##### handler

`EventsMap`\<`Public`\<`Ability`\<`A`, `C`\>\>\>\[`T`\]

#### Returns

`Unsubscribe`

#### Inherited from

[`PureAbility`](PureAbility.md).[`on`](PureAbility.md#on)

***

### ~~possibleRulesFor()~~

> **possibleRulesFor**(...`args`): `Rule`\<`A`, `C`\>[]

#### Parameters

##### args

...`AbilityParameters`\<`A`, `A` *extends* `AbilityTuple` ? (`action`, `subject`) => `0` : `never`\>

#### Returns

`Rule`\<`A`, `C`\>[]

#### Inherited from

[`PureAbility`](PureAbility.md).[`possibleRulesFor`](PureAbility.md#possiblerulesfor)

***

### ~~relevantRuleFor()~~

> **relevantRuleFor**(...`args`): `Rule`\<`A`, `C`\> \| `null`

#### Parameters

##### args

...`AbilityParameters`\<`A`\>

#### Returns

`Rule`\<`A`, `C`\> \| `null`

#### Inherited from

[`PureAbility`](PureAbility.md).[`relevantRuleFor`](PureAbility.md#relevantrulefor)

***

### ~~rulesFor()~~

> **rulesFor**(...`args`): `Rule`\<`A`, `C`\>[]

#### Parameters

##### args

...`AbilityParameters`\<`A`\>

#### Returns

`Rule`\<`A`, `C`\>[]

#### Inherited from

[`PureAbility`](PureAbility.md).[`rulesFor`](PureAbility.md#rulesfor)

***

### ~~update()~~

> **update**(`rules`): `Public`\<`this`\>

#### Parameters

##### rules

`DefineRule`\<`ToAbilityTypes`\<`A`\>, `C`, `ClaimRawRule`\<`Extract`\<`ToAbilityTypes`\<`A`\>, `string`\>\>\>[]

#### Returns

`Public`\<`this`\>

#### Inherited from

[`PureAbility`](PureAbility.md).[`update`](PureAbility.md#update)
