[**Mcp Dev**](../../README.md)

***

[Mcp Dev](../../README.md) / [mcpJson](../README.md) / initMcpJson

# Function: initMcpJson()

> **initMcpJson**(`cwd`, `io?`): `object`

Create or update `.mcp.json` at `cwd` so a coding agent discovers this server. Idempotent: it
writes only when the `stone` entry is missing, and never overwrites the rest of the file.

## Parameters

### cwd

`string`

The project root.

### io?

[`McpJsonIo`](../interfaces/McpJsonIo.md) = `defaultIo`

The filesystem surface (defaults to `node:fs`).

## Returns

`object`

The file path and whether it was written.

### changed

> **changed**: `boolean`

### file

> **file**: `string`
