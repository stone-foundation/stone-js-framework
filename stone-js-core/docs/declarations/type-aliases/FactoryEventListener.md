# Type Alias: FactoryEventListener\<TEvent\>

```ts
type FactoryEventListener<TEvent> = (container) => FunctionalEventListener<TEvent>;
```

Represents a FactoryEventListener type.

## Type Parameters

### TEvent

`TEvent` *extends* [`Event`](../../events/Event/classes/Event.md) = [`Event`](../../events/Event/classes/Event.md)

## Parameters

### container

[`IContainer`](../interfaces/IContainer.md) \| `any`

The dependency injection container.

## Returns

[`FunctionalEventListener`](FunctionalEventListener.md)\<`TEvent`\>

The event listener function.
