# Type Alias: AdapterEventHandlerType\<TEvent, UResponse\>

```ts
type AdapterEventHandlerType<TEvent, UResponse> = 
  | ILifecycleAdapterEventHandler<TEvent, UResponse>
| FunctionalAdapterEventHandler<TEvent, UResponse>;
```

AdapterEventHandler Type.

Represents an event handler which can either be a simple function or a lifecycle event handler object.

## Type Parameters

### TEvent

`TEvent` *extends* [`IncomingEvent`](../../events/IncomingEvent/classes/IncomingEvent.md) = [`IncomingEvent`](../../events/IncomingEvent/classes/IncomingEvent.md)

### UResponse

`UResponse` *extends* [`OutgoingResponse`](../../events/OutgoingResponse/classes/OutgoingResponse.md) = [`OutgoingResponse`](../../events/OutgoingResponse/classes/OutgoingResponse.md)

## Template

UResponse
