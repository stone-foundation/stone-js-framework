# Function: defineEventListener()

Defines an event listener (function, class, or factory) for a specific event type.

This utility supports functional, factory, and class-based listeners and injects the appropriate metadata
into the blueprint. The event name must be provided in `options.event`.

## Param

The listener implementation (function, class, or factory).

## Param

Listener options including event name and factory flag.

## Example

```ts
defineEventListener((event) => console.log(event), { event: 'user.created' })
```

## Call Signature

```ts
function defineEventListener<TEvent>(module, options): Partial<StoneBlueprint>;
```

Defines a function-based event listener.

### Type Parameters

#### TEvent

`TEvent` *extends* [`Event`](../../../events/Event/classes/Event.md) = [`Event`](../../../events/Event/classes/Event.md)

### Parameters

#### module

[`FunctionalEventListener`](../../../declarations/type-aliases/FunctionalEventListener.md)\<`TEvent`\>

The listener function to be registered.

#### options

[`ListenerOptions`](../../../declarations/interfaces/ListenerOptions.md) & `object`

Listener options including event name.

### Returns

`Partial`\<[`StoneBlueprint`](../../../options/StoneBlueprint/interfaces/StoneBlueprint.md)\>

A partial StoneBlueprint with the listener metadata injected.

### Param

The listener implementation (function, class, or factory).

### Param

Listener options including event name and factory flag.

### Example

```ts
defineEventListener((event) => console.log(event), { event: 'user.created' })
```

## Call Signature

```ts
function defineEventListener<TEvent>(module, options): Partial<StoneBlueprint>;
```

Defines a factory-based event listener.

### Type Parameters

#### TEvent

`TEvent` *extends* [`Event`](../../../events/Event/classes/Event.md) = [`Event`](../../../events/Event/classes/Event.md)

### Parameters

#### module

[`FactoryEventListener`](../../../declarations/type-aliases/FactoryEventListener.md)\<`TEvent`\>

A factory that returns a listener function.

#### options

[`ListenerOptions`](../../../declarations/interfaces/ListenerOptions.md) & `object`

Listener options including event name.

### Returns

`Partial`\<[`StoneBlueprint`](../../../options/StoneBlueprint/interfaces/StoneBlueprint.md)\>

A partial StoneBlueprint with the listener metadata injected.

### Param

The listener implementation (function, class, or factory).

### Param

Listener options including event name and factory flag.

### Example

```ts
defineEventListener((event) => console.log(event), { event: 'user.created' })
```

## Call Signature

```ts
function defineEventListener<TEvent>(module, options): Partial<StoneBlueprint>;
```

Defines a class-based event listener.

### Type Parameters

#### TEvent

`TEvent` *extends* [`Event`](../../../events/Event/classes/Event.md) = [`Event`](../../../events/Event/classes/Event.md)

### Parameters

#### module

[`IEventListenerClass`](../../../declarations/type-aliases/IEventListenerClass.md)\<`TEvent`\>

A class with a `handle` method.

#### options

[`ListenerOptions`](../../../declarations/interfaces/ListenerOptions.md) & `object`

Listener options including event name.

### Returns

`Partial`\<[`StoneBlueprint`](../../../options/StoneBlueprint/interfaces/StoneBlueprint.md)\>

A partial StoneBlueprint with the listener metadata injected.

### Param

The listener implementation (function, class, or factory).

### Param

Listener options including event name and factory flag.

### Example

```ts
defineEventListener((event) => console.log(event), { event: 'user.created' })
```
