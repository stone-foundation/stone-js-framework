[**Mcp Dev**](../../README.md)

***

[Mcp Dev](../../README.md) / [declarations](../README.md) / McpToolDef

# Interface: McpToolDef

A tool definition exposed to the agent over MCP. The `handler` runs in-process (the dev server
hands the SDK the callback directly): these are framework-knowledge and dev helpers, not your
domain, so they do not traverse the kernel.

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
