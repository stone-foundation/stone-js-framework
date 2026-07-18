# Type Alias: FunctionalEventHandler()\<TEvent, UResponse\>

```ts
type FunctionalEventHandler<TEvent, UResponse> = (incomingEvent) => Promiseable<UResponse>;
```

FunctionalEventHandler.

Represents a function that handles incoming events and returns an outgoing response.

## Type Parameters

### TEvent

`TEvent` *extends* [`IncomingEvent`](../../events/IncomingEvent/classes/IncomingEvent.md)

### UResponse

`UResponse` = `unknown`

## Parameters

### incomingEvent

`TEvent`

The incoming event to handle.

## Returns

[`Promiseable`](Promiseable.md)\<`UResponse`\>

The outgoing response.
