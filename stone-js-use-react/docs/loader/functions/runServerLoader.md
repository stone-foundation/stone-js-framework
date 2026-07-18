# Function: runServerLoader()

```ts
function runServerLoader<DataType, EventType>(descriptor, context): Promise<LoadOutcome<DataType>>;
```

Run a server loader against a context, applying its cross-boundary policy and failure handling.

Never throws for expected load failures: the policy decides whether to fall back, defer to the
client, or give up. Genuine programming errors in `onError` are the caller's responsibility.

## Type Parameters

### DataType

`DataType` = `unknown`

### EventType

`EventType` = `unknown`

## Parameters

### descriptor

[`ServerLoaderDescriptor`](../interfaces/ServerLoaderDescriptor.md)\<`DataType`, `EventType`\>

The loader descriptor.

### context

[`ServerLoaderContext`](../interfaces/ServerLoaderContext.md)\<`EventType`\>

The loader context.

## Returns

`Promise`\<[`LoadOutcome`](../interfaces/LoadOutcome.md)\<`DataType`\>\>

A [LoadOutcome](../interfaces/LoadOutcome.md) instructing the renderer.
