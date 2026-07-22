[**Mcp Dev**](../../README.md)

***

[Mcp Dev](../../README.md) / [McpDevServer](../README.md) / buildMcpServer

# Function: buildMcpServer()

> **buildMcpServer**(`options`, `log`): `McpServer`

Build a fully-configured MCP server: advertise the instructions and register every resolved tool
with its logging callback. The handlers run in-process (dev/knowledge helpers, not the domain).

## Parameters

### options

[`McpDevOptions`](../../declarations/interfaces/McpDevOptions.md)

The dev-server options.

### log

[`McpDevLogger`](../../declarations/type-aliases/McpDevLogger.md)

The activity logger.

## Returns

`McpServer`

The configured MCP server.
