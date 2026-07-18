# Function: isStoneBlueprint()

```ts
function isStoneBlueprint<T>(value): value is T;
```

Check if the provided value is a Stone blueprint.
This function checks if the value is an object and contains the required `stone` property.

## Type Parameters

### T

`T` *extends* [`StoneBlueprint`](../../options/StoneBlueprint/interfaces/StoneBlueprint.md)\<`any`, `any`\>

## Parameters

### value

`any`

The value to check.

## Returns

`value is T`

`true` if the value is a Stone blueprint, otherwise `false`.
