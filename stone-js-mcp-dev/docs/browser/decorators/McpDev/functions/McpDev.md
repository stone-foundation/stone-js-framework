[**Mcp Dev**](../../../../README.md)

***

[Mcp Dev](../../../../README.md) / [browser/decorators/McpDev](../README.md) / McpDev

# Function: McpDev()

> **McpDev**\<`T`\>(`_options?`): `ClassDecorator`

Browser stub of `@McpDev()`: a no-op.

The dev MCP server (`stone mcp`) is a Node-only, development concern. Stubbing the decorator for
the browser keeps an isomorphic app compiling and inert there, without dragging the CLI command,
the MCP SDK server, or `node:fs` into the browser bundle (which would break a SPA). The real
decorator lives in the Node build.

## Type Parameters

### T

`T` *extends* `ClassType` = `ClassType`

## Parameters

### \_options?

[`McpDevDecoratorOptions`](../interfaces/McpDevDecoratorOptions.md) = `{}`

Ignored in the browser.

## Returns

`ClassDecorator`

A no-op class decorator.
