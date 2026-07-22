[**Mcp Dev**](../../../../README.md)

***

[Mcp Dev](../../../../README.md) / [browser/options/McpDevBlueprint](../README.md) / mcpDevBlueprint

# Variable: mcpDevBlueprint

> `const` **mcpDevBlueprint**: [`McpDevBlueprint`](../../../../options/McpDevBlueprint/interfaces/McpDevBlueprint.md)

Browser stub of the MCP dev blueprint.

It carries the config bucket but wires **no** blueprint middleware, so importing it into a browser
bundle never pulls the Node-only `stone mcp` command, its server (`@modelcontextprotocol/sdk`,
stdio) or the filesystem. The `stone mcp` command is a development, Node-only concern; in the
browser this keeps the app compiling and inert.
