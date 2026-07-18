# Type Alias: FunctionalEventHandler()\<IncomingEventType, OutgoingResponseType\>

```ts
type FunctionalEventHandler<IncomingEventType, OutgoingResponseType> = (event) => Promiseable<OutgoingResponseType>;
```

Represents a functional event handler.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](../interfaces/IIncomingEvent.md)

The type representing the incoming event.

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

The type representing the outgoing response.

## Parameters

### event

`IncomingEventType`

The incoming event.

## Returns

`Promiseable`\<`OutgoingResponseType`\>

The outgoing response.
