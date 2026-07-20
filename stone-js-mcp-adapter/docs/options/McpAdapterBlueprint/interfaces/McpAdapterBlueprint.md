[**McpAdapter**](../../../README.md)

***

[McpAdapter](../../../README.md) / [options/McpAdapterBlueprint](../README.md) / McpAdapterBlueprint

# Interface: McpAdapterBlueprint

Blueprint for the MCP adapter.

## Extends

- `StoneBlueprint`

## Indexable

> \[`key`: `string`\]: `unknown`

Allow adding any additional custom properties.
The value of the custom properties can be of any type, depending on user requirements.

## Properties

### stone

> **stone**: [`McpAdapterConfig`](McpAdapterConfig.md)

Application-level settings, including environment, middleware, logging, and service registration.

#### Overrides

`StoneBlueprint.stone`
