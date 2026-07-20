[**FetchAdapter**](../../../README.md)

***

[FetchAdapter](../../../README.md) / [options/FetchAdapterBlueprint](../README.md) / FetchAdapterBlueprint

# Interface: FetchAdapterBlueprint

Blueprint for the Fetch adapter.

## Extends

- `StoneBlueprint`\<`IncomingHttpEvent`, `OutgoingHttpResponse`\>

## Indexable

> \[`key`: `string`\]: `unknown`

Allow adding any additional custom properties.
The value of the custom properties can be of any type, depending on user requirements.

## Properties

### stone

> **stone**: [`FetchAdapterConfig`](FetchAdapterConfig.md)

Application-level settings, including environment, middleware, logging, and service registration.

#### Overrides

`StoneBlueprint.stone`
