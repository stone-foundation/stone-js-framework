# Type Alias: EventHandlerType\<IncomingEventType, OutgoingResponseType\>

```ts
type EventHandlerType<IncomingEventType, OutgoingResponseType> = 
  | EventHandlerClass<IncomingEventType, OutgoingResponseType>
  | FactoryEventHandler<IncomingEventType, OutgoingResponseType>
| FunctionalEventHandler<IncomingEventType, OutgoingResponseType>;
```

Represents an event handler.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](../interfaces/IIncomingEvent.md)

The type representing the incoming event.

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

The type representing the outgoing response.
