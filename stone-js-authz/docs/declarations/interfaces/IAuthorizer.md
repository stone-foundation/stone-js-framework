[**Authz**](../../README.md)

***

[Authz](../../README.md) / [declarations](../README.md) / IAuthorizer

# Interface: IAuthorizer

The authorization service contract.

## Properties

### abilityFor

> **abilityFor**: (`user`) => [`AppAbility`](../type-aliases/AppAbility.md)

Build the ability for a principal.

#### Parameters

##### user

`unknown`

#### Returns

[`AppAbility`](../type-aliases/AppAbility.md)

***

### authorize

> **authorize**: (`user`, `action`, `subject`, `field?`) => `void`

Assert the principal may perform `action` on `subject`, or throw.

#### Parameters

##### user

`unknown`

##### action

`string`

##### subject

[`Subject`](../type-aliases/Subject.md)

##### field?

`string`

#### Returns

`void`

***

### can

> **can**: (`user`, `action`, `subject`, `field?`) => `boolean`

Whether the principal may perform `action` on `subject`.

#### Parameters

##### user

`unknown`

##### action

`string`

##### subject

[`Subject`](../type-aliases/Subject.md)

##### field?

`string`

#### Returns

`boolean`

***

### cannot

> **cannot**: (`user`, `action`, `subject`, `field?`) => `boolean`

Whether the principal may NOT perform `action` on `subject`.

#### Parameters

##### user

`unknown`

##### action

`string`

##### subject

[`Subject`](../type-aliases/Subject.md)

##### field?

`string`

#### Returns

`boolean`
