[**McpAdapter**](../../../README.md)

***

[McpAdapter](../../../README.md) / [options/McpAdapterBlueprint](../README.md) / mcpAdapterBlueprint

# Variable: mcpAdapterBlueprint

> `const` **mcpAdapterBlueprint**: [`McpAdapterBlueprint`](../interfaces/McpAdapterBlueprint.md)

Default blueprint for the MCP adapter.

Registers the adapter and wires the kernel (via the blueprint middleware) to route tool calls
through the [McpDispatcher](../../../McpDispatcher/README.md). Not `default` — opt in with `@Mcp({ default: true })` or by
making it the only adapter. Declare tools under `stone.mcp.tools` (see `defineMcpTools`).
