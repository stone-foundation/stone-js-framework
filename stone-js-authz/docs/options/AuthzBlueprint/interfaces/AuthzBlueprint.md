[**Authz**](../../../README.md)

***

[Authz](../../../README.md) / [options/AuthzBlueprint](../README.md) / AuthzBlueprint

# Interface: AuthzBlueprint

Blueprint for the authz module.

## Extends

- `StoneBlueprint`

## Indexable

> \[`key`: `string`\]: `unknown`

Allow adding any additional custom properties.
The value of the custom properties can be of any type, depending on user requirements.

## Properties

### stone

> **stone**: [`AuthzAppConfig`](AuthzAppConfig.md)

Application-level settings, including environment, middleware, logging, and service registration.

#### Overrides

`StoneBlueprint.stone`
