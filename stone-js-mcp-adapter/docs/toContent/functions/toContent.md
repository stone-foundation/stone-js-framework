[**McpAdapter**](../../README.md)

***

[McpAdapter](../../README.md) / [toContent](../README.md) / toContent

# Function: toContent()

> **toContent**(`response`): [`CallToolResult`](../interfaces/CallToolResult.md)

Serialises an `OutgoingResponse` (the kernel's output) into an MCP tool result.

The response content becomes text (JSON-stringified when it isn't already a string), and a
status code `>= 400` marks the result as an error so the agent knows the call failed.

## Parameters

### response

`OutgoingResponse`

The outgoing response produced by the kernel.

## Returns

[`CallToolResult`](../interfaces/CallToolResult.md)

The MCP tool result.
