[**McpAdapter**](../../../README.md)

***

[McpAdapter](../../../README.md) / [middleware/BlueprintMiddleware](../README.md) / SetMcpKernelMiddleware

# Function: SetMcpKernelMiddleware()

> **SetMcpKernelMiddleware**(`context`, `next`): `Promise`\<`IBlueprint`\>

Blueprint middleware that wires the kernel for the MCP platform: the [McpDispatcher](../../../McpDispatcher/classes/McpDispatcher.md)
becomes the event handler (routing tool calls to their handlers) and a response resolver wraps
handler results into an `OutgoingResponse`.

## Parameters

### context

`BlueprintContext`\<`IBlueprint`, `ClassType`\>

The blueprint context.

### next

`NextMiddleware`\<`BlueprintContext`\<`IBlueprint`, `ClassType`\>, `IBlueprint`\>

The next pipe.

## Returns

`Promise`\<`IBlueprint`\>

The updated blueprint.
