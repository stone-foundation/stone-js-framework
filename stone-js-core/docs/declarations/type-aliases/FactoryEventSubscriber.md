# Type Alias: FactoryEventSubscriber

```ts
type FactoryEventSubscriber = (container) => FunctionalEventSubscriber;
```

Represents a FactoryEventSubscriber type.

## Parameters

### container

[`IContainer`](../interfaces/IContainer.md) \| `any`

The dependency injection container.

## Returns

[`FunctionalEventSubscriber`](FunctionalEventSubscriber.md)

The event subscriber function.
