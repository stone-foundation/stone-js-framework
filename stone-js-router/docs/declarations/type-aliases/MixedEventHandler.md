# Type Alias: MixedEventHandler\<IncomingEventType, OutgoingResponseType\>

```ts
type MixedEventHandler<IncomingEventType, OutgoingResponseType> = 
  | MetaEventHandler<IncomingEventType, OutgoingResponseType>
  | FunctionalEventHandler<IncomingEventType, OutgoingResponseType>
  | MetaComponentEventHandler<IncomingEventType, OutgoingResponseType>
  | {
  action: string;
};
```

Represents a mixed event handler.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](../interfaces/IIncomingEvent.md) = [`IIncomingEvent`](../interfaces/IIncomingEvent.md)

The type representing the incoming event.

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

The type representing the outgoing response.
