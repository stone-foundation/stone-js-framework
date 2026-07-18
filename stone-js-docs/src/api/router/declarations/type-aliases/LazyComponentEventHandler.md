# Type Alias: LazyComponentEventHandler()\<IncomingEventType, OutgoingResponseType\>

```ts
type LazyComponentEventHandler<IncomingEventType, OutgoingResponseType> = () => Promise<ComponentEventHandlerType<IncomingEventType, OutgoingResponseType>>;
```

Represents a lazy component event handler.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](../interfaces/IIncomingEvent.md)

The type representing the incoming event.

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

The type representing the outgoing response.

## Returns

`Promise`\<[`ComponentEventHandlerType`](ComponentEventHandlerType.md)\<`IncomingEventType`, `OutgoingResponseType`\>\>
