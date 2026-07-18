# Type Alias: EventListenerType\<TEvent\>

```ts
type EventListenerType<TEvent> = 
  | IEventListenerClass<TEvent>
  | FactoryEventListener<TEvent>
| FunctionalEventListener<TEvent>;
```

Represents a EventListener type.

## Type Parameters

### TEvent

`TEvent` *extends* [`Event`](../../events/Event/classes/Event.md) = [`Event`](../../events/Event/classes/Event.md)
