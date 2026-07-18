# Type Alias: FactoryAdapterErrorHandler()\<RawEventType, RawResponseType, ExecutionContextType\>

```ts
type FactoryAdapterErrorHandler<RawEventType, RawResponseType, ExecutionContextType> = (options) => FunctionalAdapterErrorHandler<RawEventType, RawResponseType, ExecutionContextType>;
```

FactoryAdapterErrorHandler Type.

Represents a factory function that creates an adapter error handler function.

## Type Parameters

### RawEventType

`RawEventType`

### RawResponseType

`RawResponseType`

### ExecutionContextType

`ExecutionContextType`

## Parameters

### options

[`AdapterHandlerOptions`](../interfaces/AdapterHandlerOptions.md)

## Returns

[`FunctionalAdapterErrorHandler`](FunctionalAdapterErrorHandler.md)\<`RawEventType`, `RawResponseType`, `ExecutionContextType`\>
