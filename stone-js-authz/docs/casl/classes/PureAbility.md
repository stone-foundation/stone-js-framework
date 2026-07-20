[**Authz**](../../README.md)

***

[Authz](../../README.md) / [casl](../README.md) / PureAbility

# Class: PureAbility\<A, Conditions\>

Curated re-exports of the CASL essentials, so applications get one import surface from
`@stone-js/authz` and can define abilities without depending on CASL directly. Full CASL power
(conditions, field-level rules, subject detection) remains available.

## Extends

- `RuleIndex`\<`A`, `Conditions`\>

## Extended by

- [`Ability`](Ability.md)
- [`MongoAbility`](../interfaces/MongoAbility.md)

## Type Parameters

### A

`A` *extends* `Abilities` = `AbilityTuple`

### Conditions

`Conditions` = `unknown`

## Constructors

### Constructor

> **new PureAbility**\<`A`, `Conditions`\>(`rules?`, `options?`): `PureAbility`\<`A`, `Conditions`\>

#### Parameters

##### rules?

`DefineRule`\<`ToAbilityTypes`\<`A`\>, `Conditions`, `ClaimRawRule`\<`Extract`\<`ToAbilityTypes`\<`A`\>, `string`\>\>\>[]

##### options?

`RuleIndexOptions`\<`A`, `Conditions`\>

#### Returns

`PureAbility`\<`A`, `Conditions`\>

#### Inherited from

`RuleIndex<A, Conditions>.constructor`

## Properties

### \[ɵabilities\]

> `readonly` **\[ɵabilities\]**: `A`

#### Inherited from

`RuleIndex.[ɵabilities]`

***

### \[ɵconditions\]

> `readonly` **\[ɵconditions\]**: `Conditions`

#### Inherited from

`RuleIndex.[ɵconditions]`

## Accessors

### rules

#### Get Signature

> **get** **rules**(): `RawRuleFrom`\<`A`, `Conditions`\>[]

##### Returns

`RawRuleFrom`\<`A`, `Conditions`\>[]

#### Inherited from

`RuleIndex.rules`

## Methods

### actionsFor()

> **actionsFor**(`subjectType`): `string`[]

#### Parameters

##### subjectType

`ExtractSubjectType`\<`Normalize`\<`A`\>\[`1`\]\>

#### Returns

`string`[]

#### Inherited from

`RuleIndex.actionsFor`

***

### can()

> **can**(...`args`): `boolean`

#### Parameters

##### args

...`CanParameters`\<`A`\>

#### Returns

`boolean`

***

### cannot()

> **cannot**(...`args`): `boolean`

#### Parameters

##### args

...`CanParameters`\<`A`\>

#### Returns

`boolean`

***

### detectSubjectType()

> **detectSubjectType**(`object?`): `ExtractSubjectType`\<`Normalize`\<`A`\>\[`1`\]\>

#### Parameters

##### object?

`Normalize`\<`A`\>\[`1`\]

#### Returns

`ExtractSubjectType`\<`Normalize`\<`A`\>\[`1`\]\>

#### Inherited from

`RuleIndex.detectSubjectType`

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

`EventsMap`\<`Public`\<`PureAbility`\<`A`, `Conditions`\>\>\>\[`T`\]

#### Returns

`Unsubscribe`

#### Inherited from

`RuleIndex.on`

***

### possibleRulesFor()

> **possibleRulesFor**(...`args`): `Rule`\<`A`, `Conditions`\>[]

#### Parameters

##### args

...`AbilityParameters`\<`A`, `A` *extends* `AbilityTuple` ? (`action`, `subject`) => `0` : `never`\>

#### Returns

`Rule`\<`A`, `Conditions`\>[]

#### Inherited from

`RuleIndex.possibleRulesFor`

***

### relevantRuleFor()

> **relevantRuleFor**(...`args`): `Rule`\<`A`, `Conditions`\> \| `null`

#### Parameters

##### args

...`CanParameters`\<`A`\>

#### Returns

`Rule`\<`A`, `Conditions`\> \| `null`

***

### rulesFor()

> **rulesFor**(...`args`): `Rule`\<`A`, `Conditions`\>[]

#### Parameters

##### args

...`AbilityParameters`\<`A`\>

#### Returns

`Rule`\<`A`, `Conditions`\>[]

#### Inherited from

`RuleIndex.rulesFor`

***

### update()

> **update**(`rules`): `Public`\<`this`\>

#### Parameters

##### rules

`DefineRule`\<`ToAbilityTypes`\<`A`\>, `Conditions`, `ClaimRawRule`\<`Extract`\<`ToAbilityTypes`\<`A`\>, `string`\>\>\>[]

#### Returns

`Public`\<`this`\>

#### Inherited from

`RuleIndex.update`
