[**Mcp**](../../README.md)

***

[Mcp](../../README.md) / [declarations](../README.md) / McpToolDef

# Interface: McpToolDef

A tool definition, structurally compatible with `@stone-js/mcp-adapter`'s `McpTool` — so the
exported tools plug straight into `defineMcpTools()` without a hard dependency.

## Properties

### description?

> `optional` **description?**: `string`

***

### handler

> **handler**: (`args`) => `unknown`

#### Parameters

##### args

`Record`\<`string`, `unknown`\>

#### Returns

`unknown`

***

### inputSchema?

> `optional` **inputSchema?**: `Record`\<`string`, `unknown`\>

***

### name

> **name**: `string`
