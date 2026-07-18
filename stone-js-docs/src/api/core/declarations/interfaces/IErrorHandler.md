# Interface: IErrorHandler\<TEvent, UResponse\>

ErrorHandler Interface.

Represents an error handler that provides methods to report and render errors.

## Template

UResponse

## Type Parameters

### TEvent

`TEvent` *extends* [`IncomingEvent`](../../events/IncomingEvent/classes/IncomingEvent.md)

### UResponse

`UResponse` = `unknown`

## Properties

### handle

```ts
handle: FunctionalErrorHandler<TEvent, UResponse>;
```
