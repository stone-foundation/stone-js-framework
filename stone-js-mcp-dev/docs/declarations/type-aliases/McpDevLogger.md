[**Mcp Dev**](../../README.md)

***

[Mcp Dev](../../README.md) / [declarations](../README.md) / McpDevLogger

# Type Alias: McpDevLogger

> **McpDevLogger** = (`message`) => `void`

A logger for the dev server's activity. It writes to **stderr** so stdout stays reserved for the
MCP protocol (stdio transport speaks JSON-RPC on stdout — any other write there corrupts it).

## Parameters

### message

`string`

## Returns

`void`
