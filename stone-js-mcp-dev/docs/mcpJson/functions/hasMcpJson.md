[**Mcp Dev**](../../README.md)

***

[Mcp Dev](../../README.md) / [mcpJson](../README.md) / hasMcpJson

# Function: hasMcpJson()

> **hasMcpJson**(`cwd`, `io?`): `boolean`

Whether a `.mcp.json` exists at `cwd`.

## Parameters

### cwd

`string`

The project root.

### io?

[`McpJsonIo`](../interfaces/McpJsonIo.md) = `defaultIo`

The filesystem surface (defaults to `node:fs`).

## Returns

`boolean`

True when the file exists.
