[**McpAdapter**](../../README.md)

***

[McpAdapter](../../README.md) / [declarations](../README.md) / McpTool

# Interface: McpTool

A tool exposed to AI agents over MCP.

## Properties

### description?

> `optional` **description?**: `string`

Human/agent-readable description.

***

### handler

> **handler**: [`McpToolHandler`](../type-aliases/McpToolHandler.md)

The domain logic to run — the same code you'd call from an HTTP handler.

***

### inputSchema?

> `optional` **inputSchema?**: [`ZodRawShape`](../type-aliases/ZodRawShape.md)

Zod raw shape validating the arguments (MCP validates against it before your handler runs).

***

### name

> **name**: `string`

Unique tool name (what the agent calls).
