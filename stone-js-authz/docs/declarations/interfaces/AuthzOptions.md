[**Authz**](../../README.md)

***

[Authz](../../README.md) / [declarations](../README.md) / AuthzOptions

# Interface: AuthzOptions

Authorization configuration (`stone.authz.*`).

## Extended by

- [`AuthzConfig`](../../options/AuthzBlueprint/interfaces/AuthzConfig.md)

## Properties

### resolveAbility?

> `optional` **resolveAbility?**: [`AbilityResolver`](../type-aliases/AbilityResolver.md)

Builds the ability for the current principal. Defaults to a deny-all ability.
