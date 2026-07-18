# Type Alias: EventHandlerType\<TEvent, UResponse\>

```ts
type EventHandlerType<TEvent, UResponse> = 
  | EventHandlerClass<TEvent, UResponse>
  | FunctionalEventHandler<TEvent, UResponse>
| FactoryEventHandler<TEvent, UResponse>;
```

EventHandler Interface.
Represents an event handler that can handle incoming events and return outgoing responses.

## Type Parameters

### TEvent

`TEvent` *extends* [`IncomingEvent`](../../events/IncomingEvent/classes/IncomingEvent.md) = [`IncomingEvent`](../../events/IncomingEvent/classes/IncomingEvent.md)

### UResponse

`UResponse` = `unknown`

## Template

UResponse
