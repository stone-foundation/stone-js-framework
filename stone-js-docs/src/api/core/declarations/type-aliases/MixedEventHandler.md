# Type Alias: MixedEventHandler\<TEvent, UResponse\>

```ts
type MixedEventHandler<TEvent, UResponse> = 
  | FunctionalEventHandler<TEvent, UResponse>
| MetaEventHandler<TEvent, UResponse>;
```

MixedEventHandler Type.

Represents an event handler that can either be a simple function or a meta event handler.

## Type Parameters

### TEvent

`TEvent` *extends* [`IncomingEvent`](../../events/IncomingEvent/classes/IncomingEvent.md) = [`IncomingEvent`](../../events/IncomingEvent/classes/IncomingEvent.md)

### UResponse

`UResponse` = `unknown`

## Template

UResponse
