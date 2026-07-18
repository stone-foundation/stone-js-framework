# Type Alias: FactoryErrorHandler()\<TEvent, UResponse\>

```ts
type FactoryErrorHandler<TEvent, UResponse> = (container) => FunctionalErrorHandler<TEvent, UResponse>;
```

FactoryErrorHandler Type.

Represents a factory function that creates an error handler function.

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

[`FunctionalErrorHandler`](FunctionalErrorHandler.md)\<`TEvent`, `UResponse`\>

The error handler function.
