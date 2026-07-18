# Class: RouterErrorHandler\<IncomingEventType, OutgoingResponseType\>

Class representing a RouterErrorHandler.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`StoneIncomingEvent`](../../declarations/interfaces/StoneIncomingEvent.md) = [`StoneIncomingEvent`](../../declarations/interfaces/StoneIncomingEvent.md)

### OutgoingResponseType

`OutgoingResponseType` *extends* [`IOutgoingResponse`](../../declarations/type-aliases/IOutgoingResponse.md) = [`IOutgoingResponse`](../../declarations/type-aliases/IOutgoingResponse.md)

## Implements

- `IErrorHandler`\<`IncomingEventType`, `OutgoingResponseType`\>

## Constructors

### Constructor

```ts
new RouterErrorHandler<IncomingEventType, OutgoingResponseType>(options): RouterErrorHandler<IncomingEventType, OutgoingResponseType>;
```

Create a RouterErrorHandler.

#### Parameters

##### options

[`RouterErrorHandlerOptions`](../interfaces/RouterErrorHandlerOptions.md)

RouterErrorHandler options.

#### Returns

`RouterErrorHandler`\<`IncomingEventType`, `OutgoingResponseType`\>

## Methods

### handle()

```ts
handle(error, event): Promiseable<OutgoingResponseType>;
```

Handle an error.

#### Parameters

##### error

`Error`

The error to handle.

##### event

[`StoneIncomingEvent`](../../declarations/interfaces/StoneIncomingEvent.md)

The incoming http event.

#### Returns

`Promiseable`\<`OutgoingResponseType`\>

The outgoing http response.

#### Implementation of

```ts
IErrorHandler.handle
```
