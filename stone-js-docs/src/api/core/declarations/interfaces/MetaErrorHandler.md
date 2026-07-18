# Interface: MetaErrorHandler\<TEvent, UResponse\>

MetaErrorHandler Interface.

Represents a metadata object for an error handler.

## Template

UResponse

## Type Parameters

### TEvent

`TEvent` *extends* [`IncomingEvent`](../../events/IncomingEvent/classes/IncomingEvent.md)

### UResponse

`UResponse` = `unknown`

## Properties

### isClass?

```ts
optional isClass: boolean;
```

***

### isFactory?

```ts
optional isFactory: boolean;
```

***

### module

```ts
module: ErrorHandlerType<TEvent, UResponse>;
```
