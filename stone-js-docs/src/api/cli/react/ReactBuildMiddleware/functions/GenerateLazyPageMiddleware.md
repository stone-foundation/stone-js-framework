# Function: GenerateLazyPageMiddleware()

```ts
function GenerateLazyPageMiddleware(context, next): Promise<IBlueprint>;
```

Lazy: Generates a lazy pages file.

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
