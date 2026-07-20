[**McpAdapter**](../../README.md)

***

[McpAdapter](../../README.md) / [McpDispatcher](../README.md) / McpDispatcher

# Class: McpDispatcher

The kernel event handler for the MCP platform.

Every MCP tool call arrives as an `IncomingEvent` carrying the tool name and arguments; this
dispatcher looks the tool up in `stone.mcp.tools` and runs its handler — so tool calls flow
through the same kernel (middleware, DI, hooks) as any other Stone.js event.

## Constructors

### Constructor

> **new McpDispatcher**(`dependencies`): `McpDispatcher`

#### Parameters

##### dependencies

Auto-wired container services.

###### blueprint

`IBlueprint`

#### Returns

`McpDispatcher`

## Methods

### handle()

> **handle**(`event`): `Promise`\<`unknown`\>

Route the event to the matching tool's handler.

#### Parameters

##### event

`IncomingEvent`

The incoming event (metadata: `_mcpTool`, `_mcpArgs`).

#### Returns

`Promise`\<`unknown`\>

The tool's result.

#### Throws

When the tool is unknown.
