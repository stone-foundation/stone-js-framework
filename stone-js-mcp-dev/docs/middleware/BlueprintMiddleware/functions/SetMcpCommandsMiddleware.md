[**Mcp Dev**](../../../README.md)

***

[Mcp Dev](../../../README.md) / [middleware/BlueprintMiddleware](../README.md) / SetMcpCommandsMiddleware

# Function: SetMcpCommandsMiddleware()

> **SetMcpCommandsMiddleware**(`context`, `next`): `Promise`\<`IBlueprint`\>

Middleware that registers the `mcp` command when the app runs on the Node CLI adapter.

It mirrors the router's command registration: contribute a `MetaCommandHandler` to
`stone.adapter.commands` so the CLI (itself a Stone.js app on the Node CLI adapter) discovers
`stone mcp` by introspection, no hard-coding.

## Parameters

### context

`BlueprintContext`\<`IBlueprint`, `ClassType`\>

The blueprint context.

### next

`NextMiddleware`\<`BlueprintContext`\<`IBlueprint`, `ClassType`\>, `IBlueprint`\>

The next pipeline function.

## Returns

`Promise`\<`IBlueprint`\>

The updated blueprint.
