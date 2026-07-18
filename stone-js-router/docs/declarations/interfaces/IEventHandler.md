# Interface: IEventHandler\<IncomingEventType, OutgoingResponseType\>

Represents an event handler.

## Param

**IncomingEventType**

The type representing the incoming event.

## Param

**OutgoingResponseType**

The type representing the outgoing response.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](IIncomingEvent.md)

The type representing the incoming event.

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

The type representing the outgoing response.

## Indexable

```ts
[k: string]: FunctionalEventHandler<IncomingEventType, OutgoingResponseType>
```
