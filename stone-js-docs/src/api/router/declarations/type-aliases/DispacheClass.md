# Type Alias: DispacheClass()\<IncomingEventType, OutgoingResponseType\>

```ts
type DispacheClass<IncomingEventType, OutgoingResponseType> = (...args) => IDispacher<IncomingEventType, OutgoingResponseType>;
```

Represents a class dispatcher.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](../interfaces/IIncomingEvent.md)

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

## Parameters

### args

...`any`[]

## Returns

[`IDispacher`](../interfaces/IDispacher.md)\<`IncomingEventType`, `OutgoingResponseType`\>
