# Type Alias: ComponentEventHandlerClass()\<IncomingEventType, OutgoingResponseType\>

```ts
type ComponentEventHandlerClass<IncomingEventType, OutgoingResponseType> = (...args) => IComponentEventHandler<IncomingEventType, OutgoingResponseType>;
```

Represents a component event handler class.

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

[`IComponentEventHandler`](../interfaces/IComponentEventHandler.md)\<`IncomingEventType`, `OutgoingResponseType`\>
