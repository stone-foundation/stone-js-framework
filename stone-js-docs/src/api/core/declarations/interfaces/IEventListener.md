# Interface: IEventListener\<TEvent\>

Interface representing a listener for handling specific events.

Listeners implementing this interface should define a `handle` method
that is called whenever the associated event occurs.

## Type Parameters

### TEvent

`TEvent` *extends* [`Event`](../../events/Event/classes/Event.md) = [`Event`](../../events/Event/classes/Event.md)

## Properties

### handle

```ts
handle: FunctionalEventListener<TEvent>;
```

Handles the event when it occurs. This method contains the logic that runs when the event is triggered.

#### Returns

The event listener function.
