[**Mcp Dev**](../../README.md)

***

[Mcp Dev](../../README.md) / [McpDevServer](../README.md) / startMcpDevServer

# Function: startMcpDevServer()

> **startMcpDevServer**(`options`): `Promise`\<`void`\>

Start the MCP dev server over stdio and keep it alive until the process is interrupted.

The stdio transport speaks JSON-RPC on stdout and keeps the event loop alive by reading stdin,
so `Ctrl+C` (SIGINT) stops it, exactly like `stone dev`.

## Parameters

### options

[`McpDevOptions`](../../declarations/interfaces/McpDevOptions.md)

The dev-server options.

## Returns

`Promise`\<`void`\>
