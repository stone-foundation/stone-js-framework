# Function: GenerateEntryPointFileMiddleware()

```ts
function GenerateEntryPointFileMiddleware(context, next): Promise<IBlueprint>;
```

Generates an index file for all modules in the application.
This index file is used for SSR and in development mode.
Note: This entry point will be embedded in the index.html file.

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
