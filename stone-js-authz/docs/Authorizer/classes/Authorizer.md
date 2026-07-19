[**Authz**](../../README.md)

***

[Authz](../../README.md) / [Authorizer](../README.md) / Authorizer

# Class: Authorizer

The authorization service.

Isomorphic and platform-agnostic: it wraps a CASL ability (built per-principal via the
configured `resolveAbility`) to answer `can`/`cannot` and to `authorize` (throw on denial).
RBAC and ABAC are both supported, and the exact same ability can run on the frontend.

## Implements

- [`IAuthorizer`](../../declarations/interfaces/IAuthorizer.md)

## Constructors

### Constructor

> **new Authorizer**(`resolveAbility?`): `Authorizer`

#### Parameters

##### resolveAbility?

[`AbilityResolver`](../../declarations/type-aliases/AbilityResolver.md) = `DENY_ALL`

Builds the ability for a principal (defaults to deny-all).

#### Returns

`Authorizer`

## Methods

### abilityFor()

> **abilityFor**(`user`): [`AppAbility`](../../declarations/type-aliases/AppAbility.md)

#### Parameters

##### user

`unknown`

The principal.

#### Returns

[`AppAbility`](../../declarations/type-aliases/AppAbility.md)

The principal's ability.

#### Implementation of

[`IAuthorizer`](../../declarations/interfaces/IAuthorizer.md).[`abilityFor`](../../declarations/interfaces/IAuthorizer.md#abilityfor)

***

### authorize()

> **authorize**(`user`, `action`, `subject`, `field?`): `void`

Assert the principal is allowed, or throw.

#### Parameters

##### user

`unknown`

The principal.

##### action

`string`

The action.

##### subject

[`Subject`](../../declarations/type-aliases/Subject.md)

The subject.

##### field?

`string`

Optional field-level check.

#### Returns

`void`

#### Throws

When the principal is not allowed.

#### Implementation of

[`IAuthorizer`](../../declarations/interfaces/IAuthorizer.md).[`authorize`](../../declarations/interfaces/IAuthorizer.md#authorize)

***

### can()

> **can**(`user`, `action`, `subject`, `field?`): `boolean`

#### Parameters

##### user

`unknown`

The principal.

##### action

`string`

The action.

##### subject

[`Subject`](../../declarations/type-aliases/Subject.md)

The subject (type or instance).

##### field?

`string`

Optional field-level check.

#### Returns

`boolean`

Whether the principal is allowed.

#### Implementation of

[`IAuthorizer`](../../declarations/interfaces/IAuthorizer.md).[`can`](../../declarations/interfaces/IAuthorizer.md#can)

***

### cannot()

> **cannot**(`user`, `action`, `subject`, `field?`): `boolean`

#### Parameters

##### user

`unknown`

The principal.

##### action

`string`

The action.

##### subject

[`Subject`](../../declarations/type-aliases/Subject.md)

The subject.

##### field?

`string`

Optional field-level check.

#### Returns

`boolean`

Whether the principal is NOT allowed.

#### Implementation of

[`IAuthorizer`](../../declarations/interfaces/IAuthorizer.md).[`cannot`](../../declarations/interfaces/IAuthorizer.md#cannot)

***

### create()

> `static` **create**(`resolveAbility?`): `Authorizer`

#### Parameters

##### resolveAbility?

[`AbilityResolver`](../../declarations/type-aliases/AbilityResolver.md)

Builds the ability for a principal (defaults to deny-all).

#### Returns

`Authorizer`

A new Authorizer.
