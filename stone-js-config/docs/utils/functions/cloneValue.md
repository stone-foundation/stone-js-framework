# Function: cloneValue()

```ts
function cloneValue<T>(value): T;
```

Deep-clone plain objects and arrays; keep special objects (Date, Map, Set, class
instances, functions) and primitives by reference.

## Type Parameters

### T

`T`

## Parameters

### value

`T`

The value to clone.

## Returns

`T`

A structural clone.
