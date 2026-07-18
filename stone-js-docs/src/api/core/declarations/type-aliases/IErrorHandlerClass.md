# Type Alias: IErrorHandlerClass()\<TEvent, UResponse\>

```ts
type IErrorHandlerClass<TEvent, UResponse> = (...args) => IErrorHandler<TEvent, UResponse>;
```

IErrorHandlerClass Type.

## Type Parameters

### TEvent

`TEvent` *extends* [`IncomingEvent`](../../events/IncomingEvent/classes/IncomingEvent.md) = [`IncomingEvent`](../../events/IncomingEvent/classes/IncomingEvent.md)

### UResponse

`UResponse` = `unknown`

## Parameters

### args

...`any`[]

The application constructor params.

## Returns

[`IErrorHandler`](../interfaces/IErrorHandler.md)\<`TEvent`, `UResponse`\>

The error handler.
