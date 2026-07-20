[**FetchAdapter**](../../../README.md)

***

[FetchAdapter](../../../README.md) / [middleware/BlueprintMiddleware](../README.md) / SetFetchResponseResolverMiddleware

# Function: SetFetchResponseResolverMiddleware()

> **SetFetchResponseResolverMiddleware**(`context`, `next`): `Promise`\<`IBlueprint`\>

Blueprint middleware that installs the kernel response resolver for the Fetch platform.

The kernel needs a resolver to turn a handler's return value into an `OutgoingHttpResponse`.
(Binary file responses are deferred to a later release; JSON/text/bytes are covered.)

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
