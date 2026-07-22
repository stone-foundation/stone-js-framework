[**Mcp Dev**](../../README.md)

***

[Mcp Dev](../../README.md) / [McpDevServer](../README.md) / createToolCallback

# Function: createToolCallback()

> **createToolCallback**(`tool`, `log`): (`args`) => `Promise`\<[`McpToolResult`](../interfaces/McpToolResult.md)\>

Build the SDK callback for one tool: log the call to stderr, run the handler, log the outcome,
and wrap the result (or the error) as MCP content.

## Parameters

### tool

[`McpToolDef`](../../declarations/interfaces/McpToolDef.md)

The tool definition.

### log

[`McpDevLogger`](../../declarations/type-aliases/McpDevLogger.md)

The activity logger.

## Returns

The SDK tool callback.

(`args`) => `Promise`\<[`McpToolResult`](../interfaces/McpToolResult.md)\>
