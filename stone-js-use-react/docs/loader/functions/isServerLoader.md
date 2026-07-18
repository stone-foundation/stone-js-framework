# Function: isServerLoader()

```ts
function isServerLoader<DataType, EventType>(value): value is ServerLoaderDescriptor<DataType, EventType>;
```

Type guard: is a value a server-loader descriptor?

## Type Parameters

### DataType

`DataType` = `unknown`

### EventType

`EventType` = `unknown`

## Parameters

### value

`unknown`

The value to test.

## Returns

`value is ServerLoaderDescriptor<DataType, EventType>`

True if it is a [ServerLoaderDescriptor](../interfaces/ServerLoaderDescriptor.md).
