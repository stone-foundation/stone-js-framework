# Class: HttpErrorHandler

Class representing an HttpErrorHandler.

## Implements

- `IErrorHandler`\<[`IncomingHttpEvent`](../../IncomingHttpEvent/classes/IncomingHttpEvent.md), [`OutgoingHttpResponse`](../../OutgoingHttpResponse/classes/OutgoingHttpResponse.md)\>

## Constructors

### Constructor

```ts
new HttpErrorHandler(options): HttpErrorHandler;
```

Create an HttpErrorHandler.

#### Parameters

##### options

[`HttpErrorHandlerOptions`](../interfaces/HttpErrorHandlerOptions.md)

HttpErrorHandler options.

#### Returns

`HttpErrorHandler`

## Methods

### handle()

```ts
handle(error, event): OutgoingHttpResponse;
```

Handle an error.

#### Parameters

##### error

`Error`

The error to handle.

##### event

[`IncomingHttpEvent`](../../IncomingHttpEvent/classes/IncomingHttpEvent.md)

The incoming http event.

#### Returns

[`OutgoingHttpResponse`](../../OutgoingHttpResponse/classes/OutgoingHttpResponse.md)

The outgoing http response.

#### Implementation of

```ts
IErrorHandler.handle
```
