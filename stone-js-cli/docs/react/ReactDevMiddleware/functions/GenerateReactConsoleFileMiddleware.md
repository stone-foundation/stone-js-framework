# Function: GenerateReactConsoleFileMiddleware()

```ts
function GenerateReactConsoleFileMiddleware(context, next): Promise<IBlueprint>;
```

Generates console index file for all modules in the application.

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
