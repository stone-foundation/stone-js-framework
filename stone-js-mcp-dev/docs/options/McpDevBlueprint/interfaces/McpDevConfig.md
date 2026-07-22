[**Mcp Dev**](../../../README.md)

***

[Mcp Dev](../../../README.md) / [options/McpDevBlueprint](../README.md) / McpDevConfig

# Interface: McpDevConfig

MCP dev configuration bucket (`stone.mcpDev`).

## Extends

- [`McpDevOptions`](../../../declarations/interfaces/McpDevOptions.md)

## Properties

### instructions?

> `optional` **instructions?**: `string`

The `instructions` string advertised to the agent (the Continuum contract).

#### Inherited from

[`McpDevOptions`](../../../declarations/interfaces/McpDevOptions.md).[`instructions`](../../../declarations/interfaces/McpDevOptions.md#instructions)

***

### name?

> `optional` **name?**: `string`

The MCP server name advertised to the agent.

#### Inherited from

[`McpDevOptions`](../../../declarations/interfaces/McpDevOptions.md).[`name`](../../../declarations/interfaces/McpDevOptions.md#name)

***

### quiet?

> `optional` **quiet?**: `boolean`

Silence the stderr activity log.

#### Inherited from

[`McpDevOptions`](../../../declarations/interfaces/McpDevOptions.md).[`quiet`](../../../declarations/interfaces/McpDevOptions.md#quiet)

***

### report?

> `optional` **report?**: [`ReportToolsOptions`](../../../declarations/interfaces/ReportToolsOptions.md)

Enable the GitHub bug/feature report tools by passing a token + repo.

#### Inherited from

[`McpDevOptions`](../../../declarations/interfaces/McpDevOptions.md).[`report`](../../../declarations/interfaces/McpDevOptions.md#report)

***

### tools?

> `optional` **tools?**: [`McpToolDef`](../../../declarations/interfaces/McpToolDef.md)[]

Your own tools, merged with the built-in framework-knowledge tools.

#### Inherited from

[`McpDevOptions`](../../../declarations/interfaces/McpDevOptions.md).[`tools`](../../../declarations/interfaces/McpDevOptions.md#tools)

***

### version?

> `optional` **version?**: `string`

The MCP server version.

#### Inherited from

[`McpDevOptions`](../../../declarations/interfaces/McpDevOptions.md).[`version`](../../../declarations/interfaces/McpDevOptions.md#version)
