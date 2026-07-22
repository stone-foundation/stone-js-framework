[**Mcp Dev**](../../../README.md)

***

[Mcp Dev](../../../README.md) / [commands/McpCommand](../README.md) / McpCommand

# Class: McpCommand

Starts the MCP dev server from the `stone mcp` command.

It reads `stone.mcpDev` from the blueprint (server name, instructions, your tools) and lets the
MCP SDK own the protocol and tool execution: framework knowledge helpers do not need to traverse
the kernel. `--name` / `--quiet` flags override the configured values.

## Constructors

### Constructor

> **new McpCommand**(`container`): `McpCommand`

#### Parameters

##### container

`IContainer`

The dependency injection container.

#### Returns

`McpCommand`

#### Throws

If the container is not provided.

## Methods

### handle()

> **handle**(`event`): `Promise`\<`void`\>

Handle the `mcp` command: start the server and keep it running until interrupted.

#### Parameters

##### event

`IncomingEvent`

The incoming CLI event carrying the parsed flags.

#### Returns

`Promise`\<`void`\>
