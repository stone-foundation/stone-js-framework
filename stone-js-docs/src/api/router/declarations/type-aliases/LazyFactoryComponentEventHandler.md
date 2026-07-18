# Type Alias: LazyFactoryComponentEventHandler()\<IncomingEventType, OutgoingResponseType\>

```ts
type LazyFactoryComponentEventHandler<IncomingEventType, OutgoingResponseType> = () => Promise<FactoryComponentEventHandler<IncomingEventType, OutgoingResponseType>>;
```

Represents a lazy factory component event handler.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](../interfaces/IIncomingEvent.md)

The type representing the incoming event.

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

The type representing the outgoing response.

## Returns

`Promise`\<[`FactoryComponentEventHandler`](FactoryComponentEventHandler.md)\<`IncomingEventType`, `OutgoingResponseType`\>\>
