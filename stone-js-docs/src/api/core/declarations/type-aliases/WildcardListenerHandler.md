# Type Alias: WildcardListenerHandler()\<T, U\>

```ts
type WildcardListenerHandler<T, U> = (eventName, event) => Promiseable<void>;
```

Represents a wildcard event listener handler.

## Type Parameters

### T

`T` = `string` \| `symbol`

### U

`U` *extends* [`Event`](../../events/Event/classes/Event.md) = [`Event`](../../events/Event/classes/Event.md)

## Parameters

### eventName

`T`

### event

`U`

## Returns

[`Promiseable`](Promiseable.md)\<`void`\>
