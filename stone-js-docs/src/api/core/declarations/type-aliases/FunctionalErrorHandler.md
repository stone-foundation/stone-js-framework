# Type Alias: FunctionalErrorHandler()\<TEvent, UResponse\>

```ts
type FunctionalErrorHandler<TEvent, UResponse> = (error, event) => Promiseable<UResponse>;
```

FunctionalErrorHandler Type.

Represents a function that handles errors and returns responses.

## Type Parameters

### TEvent

`TEvent` *extends* [`IncomingEvent`](../../events/IncomingEvent/classes/IncomingEvent.md)

### UResponse

`UResponse` = `unknown`

## Parameters

### error

`any`

The error to handle.

### event

`TEvent`

The incoming event.

## Returns

[`Promiseable`](Promiseable.md)\<`UResponse`\>

The outgoing response.
