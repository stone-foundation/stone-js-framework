[**Mcp Dev**](../../../README.md)

***

[Mcp Dev](../../../README.md) / [options/McpDevBlueprint](../README.md) / mcpDevBlueprint

# Variable: mcpDevBlueprint

> `const` **mcpDevBlueprint**: [`McpDevBlueprint`](../interfaces/McpDevBlueprint.md)

Opt-in blueprint: import and register it to add the `stone mcp` command.

It contributes a blueprint middleware that registers the command on the Node CLI adapter. Add
your own tools and the server name/instructions under `stone.mcpDev` (or via `@McpDev()` /
`defineMcpDev()`).
