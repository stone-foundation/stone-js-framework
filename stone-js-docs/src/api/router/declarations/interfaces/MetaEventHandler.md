# Interface: MetaEventHandler\<IncomingEventType, OutgoingResponseType\>

Represents a meta event handler.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](IIncomingEvent.md)

The type representing the incoming event.

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

The type representing the outgoing response.

## Properties

### action?

```ts
optional action: string;
```

***

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
module: EventHandlerType<IncomingEventType, OutgoingResponseType>;
```
