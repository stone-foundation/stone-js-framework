[**Validation**](../../../README.md)

***

[Validation](../../../README.md) / [options/ValidationBlueprint](../README.md) / ValidationBlueprint

# Interface: ValidationBlueprint

Blueprint for the validation module.

## Extends

- `StoneBlueprint`

## Indexable

> \[`key`: `string`\]: `unknown`

Allow adding any additional custom properties.
The value of the custom properties can be of any type, depending on user requirements.

## Properties

### stone

> **stone**: [`ValidationAppConfig`](ValidationAppConfig.md)

Application-level settings, including environment, middleware, logging, and service registration.

#### Overrides

`StoneBlueprint.stone`
