[**Authz**](../../../README.md)

***

[Authz](../../../README.md) / [options/AuthzBlueprint](../README.md) / AuthzConfig

# Interface: AuthzConfig

Authorization configuration bucket (`stone.authz`).

## Extends

- [`AuthzOptions`](../../../declarations/interfaces/AuthzOptions.md)

## Properties

### resolveAbility?

> `optional` **resolveAbility?**: [`AbilityResolver`](../../../declarations/type-aliases/AbilityResolver.md)

Builds the ability for the current principal. Defaults to a deny-all ability.

#### Inherited from

[`AuthzOptions`](../../../declarations/interfaces/AuthzOptions.md).[`resolveAbility`](../../../declarations/interfaces/AuthzOptions.md#resolveability)
