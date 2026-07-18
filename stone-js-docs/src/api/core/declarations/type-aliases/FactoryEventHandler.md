# Type Alias: FactoryEventHandler()\<TEvent, UResponse\>

```ts
type FactoryEventHandler<TEvent, UResponse> = (container) => FunctionalEventHandler<TEvent, UResponse>;
```

FactoryEventHandler.

Represents a factory function that creates an event handler function.

## Type Parameters

### TEvent

`TEvent` *extends* [`IncomingEvent`](../../events/IncomingEvent/classes/IncomingEvent.md)

### UResponse

`UResponse` = `unknown`

## Parameters

### container

The dependency injection container.

[`IContainer`](IContainer.md) | `any`

## Returns

[`FunctionalEventHandler`](FunctionalEventHandler.md)\<`TEvent`, `UResponse`\>

The event handler function.
