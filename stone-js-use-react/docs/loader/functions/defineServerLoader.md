# Function: defineServerLoader()

```ts
function defineServerLoader<DataType, EventType>(load, options?): ServerLoaderDescriptor<DataType, EventType>;
```

Declare a server-preferred data loader (imperative substrate; the declarative layer builds on it).

## Type Parameters

### DataType

`DataType` = `unknown`

### EventType

`EventType` = `unknown`

## Parameters

### load

(`context`) => `DataType` \| `Promise`\<`DataType`\>

The loader function, called with a [ServerLoaderContext](../interfaces/ServerLoaderContext.md).

### options?

[`ServerLoaderOptions`](../interfaces/ServerLoaderOptions.md)\<`DataType`, `EventType`\>

Policy and fallback options.

## Returns

[`ServerLoaderDescriptor`](../interfaces/ServerLoaderDescriptor.md)\<`DataType`, `EventType`\>

A normalized [ServerLoaderDescriptor](../interfaces/ServerLoaderDescriptor.md).
