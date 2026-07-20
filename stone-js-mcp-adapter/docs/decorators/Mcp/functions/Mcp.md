[**McpAdapter**](../../../README.md)

***

[McpAdapter](../../../README.md) / [decorators/Mcp](../README.md) / Mcp

# Function: Mcp()

> **Mcp**\<`T`\>(`options?`): `ClassDecorator`

Class decorator registering the MCP adapter on a Stone application.

## Type Parameters

### T

`T` *extends* `ClassType` = `ClassType`

## Parameters

### options?

[`McpDecoratorOptions`](../interfaces/McpDecoratorOptions.md) = `{}`

Adapter options (merged over the defaults).

## Returns

`ClassDecorator`

A class decorator.

## Example

```ts
@Mcp({ default: true })
@StoneApp()
class Application {}
```
