# Function: GenerateIndexHtmlFileMiddleware()

```ts
function GenerateIndexHtmlFileMiddleware(context, next): Promise<IBlueprint>;
```

Generates an index HTML file for the application.

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
