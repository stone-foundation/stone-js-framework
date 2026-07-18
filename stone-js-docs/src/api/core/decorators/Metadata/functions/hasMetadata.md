# Function: hasMetadata()

```ts
function hasMetadata<T>(Class, key): boolean;
```

Check if a class has specific metadata.

## Type Parameters

### T

`T` *extends* [`ClassType`](../../../declarations/type-aliases/ClassType.md)

## Parameters

### Class

`T`

The class to check for metadata.

### key

`PropertyKey`

The key of the metadata to check.

## Returns

`boolean`

True if the metadata key exists on the class, false otherwise.
