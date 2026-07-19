[**Auth**](../../../README.md)

***

[Auth](../../../README.md) / [options/AuthBlueprint](../README.md) / AuthBlueprint

# Interface: AuthBlueprint

Blueprint for the auth module.

## Extends

- `StoneBlueprint`

## Indexable

> \[`key`: `string`\]: `unknown`

Allow adding any additional custom properties.
The value of the custom properties can be of any type, depending on user requirements.

## Properties

### stone

> **stone**: [`AuthAppConfig`](AuthAppConfig.md)

Application-level settings, including environment, middleware, logging, and service registration.

#### Overrides

`StoneBlueprint.stone`
