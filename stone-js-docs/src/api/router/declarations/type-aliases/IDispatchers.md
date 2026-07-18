# Type Alias: IDispatchers\<IncomingEventType, OutgoingResponseType\>

```ts
type IDispatchers<IncomingEventType, OutgoingResponseType> = Record<DispacherType, DispacheClass<IncomingEventType, OutgoingResponseType>>;
```

Collection of dispatchers for route handling.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](../interfaces/IIncomingEvent.md)

### OutgoingResponseType

`OutgoingResponseType` = `unknown`
