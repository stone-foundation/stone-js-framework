# Type Alias: ComponentEventHandlerType\<IncomingEventType, OutgoingResponseType\>

```ts
type ComponentEventHandlerType<IncomingEventType, OutgoingResponseType> = 
  | ComponentEventHandlerClass<IncomingEventType, OutgoingResponseType>
| FactoryComponentEventHandler<IncomingEventType, OutgoingResponseType>;
```

Represents a component event handler type.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](../interfaces/IIncomingEvent.md)

The type representing the incoming event.

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

The type representing the outgoing response.
