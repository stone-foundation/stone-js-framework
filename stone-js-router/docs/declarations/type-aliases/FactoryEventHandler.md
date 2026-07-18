# Type Alias: FactoryEventHandler\<IncomingEventType, OutgoingResponseType\>

```ts
type FactoryEventHandler<IncomingEventType, OutgoingResponseType> = (resolver?) => FunctionalEventHandler<IncomingEventType, OutgoingResponseType>;
```

Represents a factory event handler.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](../interfaces/IIncomingEvent.md)

The type representing the incoming event.

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

The type representing the outgoing response.

## Parameters

### resolver?

  \| [`DependencyResolver`](../interfaces/DependencyResolver.md)
  \| `IContainer`
  \| `any`

The route resolver.

## Returns

[`FunctionalEventHandler`](FunctionalEventHandler.md)\<`IncomingEventType`, `OutgoingResponseType`\>

A functional event handler.
