# Class: RouterEventHandler\<IncomingEventType, OutgoingResponseType\>

A router event handler for processing incoming events.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`StoneIncomingEvent`](../../declarations/interfaces/StoneIncomingEvent.md) = [`StoneIncomingEvent`](../../declarations/interfaces/StoneIncomingEvent.md)

The type representing the incoming event.

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

The type representing the outgoing response.

## Implements

- `IEventHandler`\<`IncomingEventType`, `OutgoingResponseType`\>

## Constructors

### Constructor

```ts
protected new RouterEventHandler<IncomingEventType, OutgoingResponseType>(options): RouterEventHandler<IncomingEventType, OutgoingResponseType>;
```

Constructs a `RouterEventHandler` instance.

#### Parameters

##### options

[`RouterEventHandlerOptions`](../interfaces/RouterEventHandlerOptions.md)\<`IncomingEventType`, `OutgoingResponseType`\>

The RouterEventHandler options including blueprint, container, and event emitter.

#### Returns

`RouterEventHandler`\<`IncomingEventType`, `OutgoingResponseType`\>

## Methods

### handle()

```ts
handle(event): Promise<OutgoingResponseType>;
```

Handle an incoming event.

#### Parameters

##### event

`IncomingEventType`

The incoming event to process.

#### Returns

`Promise`\<`OutgoingResponseType`\>

The outgoing response.

#### Implementation of

```ts
IEventHandler.handle
```
