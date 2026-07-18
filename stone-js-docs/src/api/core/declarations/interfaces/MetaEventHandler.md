# Interface: MetaEventHandler\<TEvent, UResponse\>

MetaEventHandler Interface.

Represents a metadata object for an app event handler.

## Template

UResponse

## Type Parameters

### TEvent

`TEvent` *extends* [`IncomingEvent`](../../events/IncomingEvent/classes/IncomingEvent.md) = [`IncomingEvent`](../../events/IncomingEvent/classes/IncomingEvent.md)

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
module: EventHandlerType<TEvent, UResponse>;
```
