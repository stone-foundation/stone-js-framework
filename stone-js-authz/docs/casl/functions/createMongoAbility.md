[**Authz**](../../README.md)

***

[Authz](../../README.md) / [casl](../README.md) / createMongoAbility

# Function: createMongoAbility()

Curated re-exports of the CASL essentials, so applications get one import surface from
`@stone-js/authz` and can define abilities without depending on CASL directly. Full CASL power
(conditions, field-level rules, subject detection) remains available.

## Call Signature

> **createMongoAbility**\<`T`\>(`rules?`, `options?`): `T`

Creates Ability with MongoDB conditions matcher

### Type Parameters

#### T

`T` *extends* `AnyMongoAbility` = [`MongoAbility`](../interfaces/MongoAbility.md)\<`AbilityTuple`, [`MongoQuery`](../type-aliases/MongoQuery.md)\>

### Parameters

#### rules?

[`RawRuleOf`](../type-aliases/RawRuleOf.md)\<`T`\>[]

#### options?

`AbilityOptionsOf`\<`T`\>

### Returns

`T`

## Call Signature

> **createMongoAbility**\<`A`, `C`\>(`rules?`, `options?`): [`MongoAbility`](../interfaces/MongoAbility.md)\<`A`, `C`\>

Creates Ability with MongoDB conditions matcher

### Type Parameters

#### A

`A` *extends* `AbilityTuple` = `AbilityTuple`

#### C

`C` *extends* [`MongoQuery`](../type-aliases/MongoQuery.md) = [`MongoQuery`](../type-aliases/MongoQuery.md)

### Parameters

#### rules?

`RawRuleFrom`\<`A`, `C`\>[]

#### options?

`AbilityOptions`\<`A`, `C`\>

### Returns

[`MongoAbility`](../interfaces/MongoAbility.md)\<`A`, `C`\>
