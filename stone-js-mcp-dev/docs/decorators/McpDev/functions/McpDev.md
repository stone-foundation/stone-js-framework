[**Mcp Dev**](../../../README.md)

***

[Mcp Dev](../../../README.md) / [decorators/McpDev](../README.md) / McpDev

# Function: McpDev()

> **McpDev**\<`T`\>(`options?`): `ClassDecorator`

A class decorator that adds the `stone mcp` command to your app.

Declarative counterpart of registering [mcpDevBlueprint](../../../options/McpDevBlueprint/variables/mcpDevBlueprint.md): apply it to your app class to
expose the framework-knowledge tools (plus any you declare) to a coding agent over MCP.

## Type Parameters

### T

`T` *extends* `ClassType` = `ClassType`

## Parameters

### options?

[`McpDevDecoratorOptions`](../interfaces/McpDevDecoratorOptions.md) = `{}`

The MCP dev options (server name, instructions, your tools).

## Returns

`ClassDecorator`

A class decorator.

## Example

```typescript
@McpDev({ tools: [myTool] })
@StoneApp({ name: 'my-app' })
export class Application {}
```
