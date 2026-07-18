# Function: CloneStarterMiddleware()

```ts
function CloneStarterMiddleware(context, next): Promise<IBlueprint>;
```

Materialise the selected starter into the destination directory.

Resolves the starter from the registered providers (the default official provider or any
third-party provider declared under `stone.createApp.starters`) and copies its files using
the starter's own source (git/local/custom). Nothing about the starter set is hard-coded here.

## Parameters

### context

[`ConsoleContext`](../../../declarations/interfaces/ConsoleContext.md)

Input data to transform via middleware.

### next

`NextPipe`\<[`ConsoleContext`](../../../declarations/interfaces/ConsoleContext.md), `IBlueprint`\>

Function to pass to the next middleware.

## Returns

`Promise`\<`IBlueprint`\>

A promise resolving with the context object.
