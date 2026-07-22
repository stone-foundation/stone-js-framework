[**Mcp Dev**](../../README.md)

***

[Mcp Dev](../../README.md) / [mcpJson](../README.md) / McpJsonIo

# Interface: McpJsonIo

Injectable filesystem surface, so `.mcp.json` handling stays testable.

## Properties

### exists

> **exists**: (`path`) => `boolean`

#### Parameters

##### path

`string`

#### Returns

`boolean`

***

### read

> **read**: (`path`) => `string`

#### Parameters

##### path

`string`

#### Returns

`string`

***

### write

> **write**: (`path`, `content`) => `void`

#### Parameters

##### path

`string`

##### content

`string`

#### Returns

`void`
