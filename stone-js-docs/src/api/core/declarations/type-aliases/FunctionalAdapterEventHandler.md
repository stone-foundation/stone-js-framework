# Type Alias: FunctionalAdapterEventHandler()\<TEvent, UResponse\>

```ts
type FunctionalAdapterEventHandler<TEvent, UResponse> = (incomingEvent) => Promiseable<UResponse>;
```

FunctionalAdapterEventHandler.

Represents a function that handles incoming events and returns an outgoing response.

## Type Parameters

### TEvent

`TEvent` *extends* [`IncomingEvent`](../../events/IncomingEvent/classes/IncomingEvent.md)

### UResponse

`UResponse` *extends* [`OutgoingResponse`](../../events/OutgoingResponse/classes/OutgoingResponse.md)

## Parameters

### incomingEvent

`TEvent`

The incoming event to handle.

## Returns

[`Promiseable`](Promiseable.md)\<`UResponse`\>

The outgoing response.
