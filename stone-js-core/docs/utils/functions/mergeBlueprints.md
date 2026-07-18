# Function: mergeBlueprints()

```ts
function mergeBlueprints<U, V>(...blueprints): StoneBlueprint<U, V>;
```

Merges multiple blueprints into a single application blueprint.

This function takes any number of blueprint objects and merges them into one,
with later blueprints overwriting properties of earlier ones in case of conflicts.
Deep-merges via `@stone-js/config`'s `deepMerge`: plain objects merge recursively, arrays
concatenate, and special objects (Date, Map, Set, class instances) are preserved instead of
being flattened. Writes are guarded against prototype pollution. A single, shared merge
implementation across the framework.

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
