# Type Alias: ErrorHandlerType\<TEvent, UResponse\>

```ts
type ErrorHandlerType<TEvent, UResponse> = 
  | IErrorHandlerClass<TEvent, UResponse>
  | FunctionalErrorHandler<TEvent, UResponse>
| FactoryErrorHandler<TEvent, UResponse>;
```

ErrorHandler Type.

Represents an error handler which can either be a class, a simple function or a factory function.

## Type Parameters

### TEvent

`TEvent` *extends* [`IncomingEvent`](../../events/IncomingEvent/classes/IncomingEvent.md)

### UResponse

`UResponse` = `unknown`
