# Type Alias: FunctionalAdapterErrorHandler()\<RawEventType, RawResponseType, ExecutionContextType\>

```ts
type FunctionalAdapterErrorHandler<RawEventType, RawResponseType, ExecutionContextType> = (error, context) => Promiseable<IAdapterEventBuilder<RawResponseOptions, IRawResponseWrapper<RawResponseType>>>;
```

FunctionalAdapterErrorHandler Type.

Represents a function that handles errors and returns responses.

## Type Parameters

### RawEventType

`RawEventType`

### RawResponseType

`RawResponseType`

### ExecutionContextType

`ExecutionContextType`

## Parameters

### error

`any`

### context

[`AdapterErrorContext`](../interfaces/AdapterErrorContext.md)\<`RawEventType`, `RawResponseType`, `ExecutionContextType`\>

## Returns

[`Promiseable`](Promiseable.md)\<[`IAdapterEventBuilder`](../interfaces/IAdapterEventBuilder.md)\<[`RawResponseOptions`](../interfaces/RawResponseOptions.md), [`IRawResponseWrapper`](../interfaces/IRawResponseWrapper.md)\<`RawResponseType`\>\>\>
