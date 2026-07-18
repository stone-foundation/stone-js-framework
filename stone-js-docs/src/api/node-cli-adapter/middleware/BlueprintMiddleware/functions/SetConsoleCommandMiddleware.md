# Function: SetConsoleCommandMiddleware()

```ts
function SetConsoleCommandMiddleware(context, next): Promise<IBlueprint>;
```

Middleware to process and register modules as command handlers.

## Parameters

### context

`BlueprintContext`\<`IBlueprint`, `ClassType`\>

The configuration context containing the modules and blueprint.

### next

`NextMiddleware`\<`BlueprintContext`\<`IBlueprint`, `ClassType`\>, `IBlueprint`\>

The next middleware in the pipeline to call.

## Returns

`Promise`\<`IBlueprint`\>

The updated blueprint or a promise resolving to it.
