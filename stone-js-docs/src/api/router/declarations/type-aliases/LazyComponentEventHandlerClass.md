# Type Alias: LazyComponentEventHandlerClass()\<IncomingEventType, OutgoingResponseType\>

```ts
type LazyComponentEventHandlerClass<IncomingEventType, OutgoingResponseType> = () => Promise<ComponentEventHandlerClass<IncomingEventType, OutgoingResponseType>>;
```

Represents a lazy component event handler class.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](../interfaces/IIncomingEvent.md)

The type representing the incoming event.

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

The type representing the outgoing response.

## Returns

`Promise`\<[`ComponentEventHandlerClass`](ComponentEventHandlerClass.md)\<`IncomingEventType`, `OutgoingResponseType`\>\>
