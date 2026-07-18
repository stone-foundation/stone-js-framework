# Type Alias: MixedListenerHandler\<TEventType, UEventName\>

```ts
type MixedListenerHandler<TEventType, UEventName> = 
  | ListenerHandler<TEventType>
| WildcardListenerHandler<UEventName, TEventType>;
```

Represents a listener handler that can either be a simple function or a wildcard function.

## Type Parameters

### TEventType

`TEventType` *extends* [`Event`](../../events/Event/classes/Event.md)

### UEventName

`UEventName`
