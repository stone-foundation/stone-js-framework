# Class: EventEmitter

Class representing an EventEmitter.

## Constructors

### Constructor

```ts
new EventEmitter(): EventEmitter;
```

Create an EventEmitter.

#### Returns

`EventEmitter`

## Methods

### emit()

```ts
emit<TEvent>(event, args?): Promise<void>;
```

Emits an event, triggering all associated listeners in registration order.

Always returns a promise: `await emit(...)` waits for every (sync and async) listener to
settle. A synchronous caller may fire-and-forget, but then it opts out of awaiting async
listeners and of handling their errors.

Listeners are isolated: one that throws or rejects does not prevent the others from
running. If any listener fails, `emit` rejects **after** all have run — with the single
error, or an `AggregateError` when several failed.

#### Type Parameters

##### TEvent

`TEvent` *extends* [`Event`](../../Event/classes/Event.md) = [`Event`](../../Event/classes/Event.md)

#### Parameters

##### event

`string` \| `symbol` \| `TEvent`

The event name or an instance of Event.

##### args?

`any`

Additional arguments to pass to the listeners.

#### Returns

`Promise`\<`void`\>

***

### off()

```ts
off<TEvent>(event, handler): this;
```

Removes an event listener for the given event type.

#### Type Parameters

##### TEvent

`TEvent` *extends* [`Event`](../../Event/classes/Event.md) = [`Event`](../../Event/classes/Event.md)

#### Parameters

##### event

[`WildcardEventName`](../../../declarations/type-aliases/WildcardEventName.md)

The event name or type.

##### handler

[`MixedListenerHandler`](../../../declarations/type-aliases/MixedListenerHandler.md)\<`TEvent`, [`WildcardEventName`](../../../declarations/type-aliases/WildcardEventName.md)\>

The callback to remove.

#### Returns

`this`

***

### on()

```ts
on<TEvent>(event, handler): this;
```

Registers an event listener for the given event type.

#### Type Parameters

##### TEvent

`TEvent` *extends* [`Event`](../../Event/classes/Event.md) = [`Event`](../../Event/classes/Event.md)

#### Parameters

##### event

[`WildcardEventName`](../../../declarations/type-aliases/WildcardEventName.md)

The event name or type.

##### handler

[`MixedListenerHandler`](../../../declarations/type-aliases/MixedListenerHandler.md)\<`TEvent`, [`WildcardEventName`](../../../declarations/type-aliases/WildcardEventName.md)\>

The callback to invoke when the event is emitted.

#### Returns

`this`

***

### once()

```ts
once<TEvent>(event, handler): this;
```

Registers a one-shot event listener that is removed after its first invocation.

#### Type Parameters

##### TEvent

`TEvent` *extends* [`Event`](../../Event/classes/Event.md) = [`Event`](../../Event/classes/Event.md)

#### Parameters

##### event

[`WildcardEventName`](../../../declarations/type-aliases/WildcardEventName.md)

The event name or type.

##### handler

[`MixedListenerHandler`](../../../declarations/type-aliases/MixedListenerHandler.md)\<`TEvent`, [`WildcardEventName`](../../../declarations/type-aliases/WildcardEventName.md)\>

The callback to invoke once when the event is emitted.

#### Returns

`this`

***

### create()

```ts
static create(): EventEmitter;
```

Create an EventEmitter.

#### Returns

`EventEmitter`

A new EventEmitter instance.
