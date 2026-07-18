# Type Alias: FactoryEventListener()\<TEvent\>

```ts
type FactoryEventListener<TEvent> = (container) => FunctionalEventListener<TEvent>;
```

Represents a FactoryEventListener type.

## Type Parameters

### TEvent

`TEvent` *extends* [`Event`](../../events/Event/classes/Event.md) = [`Event`](../../events/Event/classes/Event.md)

## Parameters

### container

The dependency injection container.

[`IContainer`](IContainer.md) | `any`

## Returns

[`FunctionalEventListener`](FunctionalEventListener.md)\<`TEvent`\>

The event listener function.
