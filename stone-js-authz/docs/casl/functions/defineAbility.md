[**Authz**](../../README.md)

***

[Authz](../../README.md) / [casl](../README.md) / defineAbility

# Function: defineAbility()

Curated re-exports of the CASL essentials, so applications get one import surface from
`@stone-js/authz` and can define abilities without depending on CASL directly. Full CASL power
(conditions, field-level rules, subject detection) remains available.

## Call Signature

> **defineAbility**\<`T`\>(`define`, `options?`): `Promise`\<`T`\>

### Type Parameters

#### T

`T` *extends* `AnyMongoAbility` = [`MongoAbility`](../interfaces/MongoAbility.md)\<`AbilityTuple`, [`MongoQuery`](../type-aliases/MongoQuery.md)\>

### Parameters

#### define

`DSL`\<`T`, `Promise`\<`void`\>\>

#### options?

`AbilityOptionsOf`\<`T`\>

### Returns

`Promise`\<`T`\>

## Call Signature

> **defineAbility**\<`T`\>(`define`, `options?`): `T`

### Type Parameters

#### T

`T` *extends* `AnyMongoAbility` = [`MongoAbility`](../interfaces/MongoAbility.md)\<`AbilityTuple`, [`MongoQuery`](../type-aliases/MongoQuery.md)\>

### Parameters

#### define

`DSL`\<`T`, `void`\>

#### options?

`AbilityOptionsOf`\<`T`\>

### Returns

`T`
