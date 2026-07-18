# Type Alias: FactoryComponentEventHandler()\<IncomingEventType, OutgoingResponseType\>

```ts
type FactoryComponentEventHandler<IncomingEventType, OutgoingResponseType> = (resolver?) => IComponentEventHandler<IncomingEventType, OutgoingResponseType>;
```

Represents a factory component event handler.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](../interfaces/IIncomingEvent.md)

The type representing the incoming event.

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

The type representing the outgoing response.

## Parameters

### resolver?

[`DependencyResolver`](../interfaces/DependencyResolver.md) | `IContainer` | `any`

## Returns

[`IComponentEventHandler`](../interfaces/IComponentEventHandler.md)\<`IncomingEventType`, `OutgoingResponseType`\>
