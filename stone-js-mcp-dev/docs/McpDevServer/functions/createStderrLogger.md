[**Mcp Dev**](../../README.md)

***

[Mcp Dev](../../README.md) / [McpDevServer](../README.md) / createStderrLogger

# Function: createStderrLogger()

> **createStderrLogger**(`quiet?`): [`McpDevLogger`](../../declarations/type-aliases/McpDevLogger.md)

Create the activity logger. It writes to **stderr** (never stdout, which the stdio transport
reserves for the JSON-RPC protocol); a no-op when `quiet` is set.

## Parameters

### quiet?

`boolean` = `false`

Silence the log.

## Returns

[`McpDevLogger`](../../declarations/type-aliases/McpDevLogger.md)

The logger.
