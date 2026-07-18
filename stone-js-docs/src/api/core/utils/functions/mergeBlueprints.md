# Function: mergeBlueprints()

```ts
function mergeBlueprints<U, V>(...blueprints): StoneBlueprint<U, V>;
```

Merges multiple blueprints into a single application blueprint.

This function takes any number of blueprint objects and merges them into one,
with later blueprints overwriting properties of earlier ones in case of conflicts.
It uses deep merging to ensure nested properties are also combined appropriately.
Note: The `deepmerge` function can lead to unexpected results if objects have circular references.
Consider handling such cases or documenting this behavior if it applies to your usage.

## Type Parameters

### U

`U` *extends* [`IncomingEvent`](../../events/IncomingEvent/classes/IncomingEvent.md) = [`IncomingEvent`](../../events/IncomingEvent/classes/IncomingEvent.md)

### V

`V` *extends* [`OutgoingResponse`](../../events/OutgoingResponse/classes/OutgoingResponse.md) = [`OutgoingResponse`](../../events/OutgoingResponse/classes/OutgoingResponse.md)

## Parameters

### blueprints

...(
  \| `Record`\<`string`, `any`\>
  \| [`StoneBlueprint`](../../options/StoneBlueprint/interfaces/StoneBlueprint.md)\<`U`, `V`\>)[]

An array of blueprints to be merged.

## Returns

[`StoneBlueprint`](../../options/StoneBlueprint/interfaces/StoneBlueprint.md)\<`U`, `V`\>

The merged application blueprint.

## Throws

- If any of the provided blueprints are not valid objects.

## Example

```typescript
const mergedBlueprint = mergeBlueprints(blueprint1, blueprint2);
```
