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

Emits an event, triggering all associated listeners.

#### Type Parameters

##### TEvent

`TEvent` *extends* [`Event`](../../Event/classes/Event.md) = [`Event`](../../Event/classes/Event.md)

#### Parameters

##### event

The event name or an instance of Event.

`string` | `symbol` | `TEvent`

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

### create()

```ts
static create(): EventEmitter;
```

Create an EventEmitter.

#### Returns

`EventEmitter`

A new EventEmitter instance.
