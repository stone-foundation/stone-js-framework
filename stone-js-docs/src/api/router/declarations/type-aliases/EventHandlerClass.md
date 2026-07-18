# Type Alias: EventHandlerClass()\<IncomingEventType, OutgoingResponseType\>

```ts
type EventHandlerClass<IncomingEventType, OutgoingResponseType> = (...args) => 
  | IEventHandler<IncomingEventType, OutgoingResponseType>
  | unknown;
```

Represents an event handler class.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](../interfaces/IIncomingEvent.md)

The type representing the incoming event.

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

The type representing the outgoing response.

## Parameters

### args

...`any`[]

## Returns

  \| [`IEventHandler`](../interfaces/IEventHandler.md)\<`IncomingEventType`, `OutgoingResponseType`\>
  \| `unknown`
