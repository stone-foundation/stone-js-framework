# Function: GenerateViewsIndexMiddleware()

```ts
function GenerateViewsIndexMiddleware(context, next): Promise<IBlueprint>;
```

Lazy: Generates an index file for all views in the application.

## Parameters

### context

[`ConsoleContext`](../../../declarations/interfaces/ConsoleContext.md)

The console context.

### next

`NextPipe`\<[`ConsoleContext`](../../../declarations/interfaces/ConsoleContext.md), `IBlueprint`\>

The next pipe function.

## Returns

`Promise`\<`IBlueprint`\>

The updated blueprint object.
