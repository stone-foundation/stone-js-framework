[**Mcp Dev**](../../README.md)

***

[Mcp Dev](../../README.md) / [mcpJson](../README.md) / mergeMcpJson

# Function: mergeMcpJson()

> **mergeMcpJson**(`existing`): `object`

Merge the `stone` server into an existing `.mcp.json` object without clobbering anything.

It only adds the `stone` entry when absent, so a developer's own config (other servers, or a
customized `stone` entry) is preserved.

## Parameters

### existing

`Record`\<`string`, `unknown`\> \| `undefined`

The parsed `.mcp.json` (or undefined when the file does not exist).

## Returns

`object`

The merged config and whether it changed.

### changed

> **changed**: `boolean`

### config

> **config**: `Record`\<`string`, `unknown`\>
