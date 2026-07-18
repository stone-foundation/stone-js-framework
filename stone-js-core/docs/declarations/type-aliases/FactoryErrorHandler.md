# Type Alias: FactoryErrorHandler\<TEvent, UResponse\>

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

[`IContainer`](../interfaces/IContainer.md) \| `any`

The dependency injection container.

## Returns

[`FunctionalErrorHandler`](FunctionalErrorHandler.md)\<`TEvent`, `UResponse`\>

The error handler function.
