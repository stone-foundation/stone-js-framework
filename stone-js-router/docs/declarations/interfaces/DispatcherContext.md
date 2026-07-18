# Interface: DispatcherContext\<IncomingEventType, OutgoingResponseType\>

Represents a dispatcher context.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](IIncomingEvent.md)

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

## Properties

### event

```ts
event: IncomingEventType;
```

***

### route

```ts
route: Route<IncomingEventType, OutgoingResponseType>;
```
