[**Mcp Dev**](../../README.md)

***

[Mcp Dev](../../README.md) / [declarations](../README.md) / McpDevOptions

# Interface: McpDevOptions

Options for the MCP dev server, exposed on the blueprint under `stone.mcpDev`.

`stone mcp` starts an MCP server (stdio) that hands the SDK the built-in framework-knowledge
tools merged with yours, and logs every tool call to stderr so you watch the agent think.

## Extended by

- [`McpDevDecoratorOptions`](../../decorators/McpDev/interfaces/McpDevDecoratorOptions.md)
- [`McpDevConfig`](../../options/McpDevBlueprint/interfaces/McpDevConfig.md)
- [`McpDevDecoratorOptions`](../../browser/decorators/McpDev/interfaces/McpDevDecoratorOptions.md)

## Properties

### instructions?

> `optional` **instructions?**: `string`

The `instructions` string advertised to the agent (the Continuum contract).

***

### name?

> `optional` **name?**: `string`

The MCP server name advertised to the agent.

***

### quiet?

> `optional` **quiet?**: `boolean`

Silence the stderr activity log.

***

### report?

> `optional` **report?**: [`ReportToolsOptions`](ReportToolsOptions.md)

Enable the GitHub bug/feature report tools by passing a token + repo.

***

### tools?

> `optional` **tools?**: [`McpToolDef`](McpToolDef.md)[]

Your own tools, merged with the built-in framework-knowledge tools.

***

### version?

> `optional` **version?**: `string`

The MCP server version.
