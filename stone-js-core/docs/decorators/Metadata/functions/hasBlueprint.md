# Function: hasBlueprint()

```ts
function hasBlueprint<T>(Class): boolean;
```

Check if a class has blueprint.

## Type Parameters

### T

`T` *extends* [`ClassType`](../../../declarations/type-aliases/ClassType.md)

## Parameters

### Class

`T`

The class to check for metadata.

## Returns

`boolean`

True if the metadata and BLUEPRINT_KEY keys exist on the class, false otherwise.
