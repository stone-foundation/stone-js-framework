# Function: setUseReactAdapterErrorHandler()

```ts
function setUseReactAdapterErrorHandler(errorHandler, context): BlueprintContext<IBlueprint, ClassType>;
```

Sets the error handler for the React adapter and registers error pages.

## Parameters

### errorHandler

The error handler to set for the React adapter.

*typeof* [`UseReactBrowserErrorHandler`](../../../browser/UseReactBrowserErrorHandler/classes/UseReactBrowserErrorHandler.md) | *typeof* [`UseReactServerErrorHandler`](../../../server/UseReactServerErrorHandler/classes/UseReactServerErrorHandler.md)

### context

`BlueprintContext`\<`IBlueprint`, `ClassType`\>

The blueprint context containing modules and blueprint.

## Returns

`BlueprintContext`\<`IBlueprint`, `ClassType`\>

The updated blueprint context with the error handler and error pages set.
