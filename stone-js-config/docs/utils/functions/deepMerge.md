# Function: deepMerge()

```ts
function deepMerge<T>(target, source): T;
```

Deep-merge two values. Plain objects merge recursively, arrays concatenate, and every
other value (Date, Map, Set, class instance, primitive) is replaced by the source
(cloned for plain structures, kept by reference otherwise). Pollution keys are skipped.

## Type Parameters

### T

`T`

## Parameters

### target

`T`

The base value.

### source

`unknown`

The overriding value.

## Returns

`T`

The merged value.
