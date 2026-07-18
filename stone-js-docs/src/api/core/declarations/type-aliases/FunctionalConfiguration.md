# Type Alias: FunctionalConfiguration()\<TValues\>

```ts
type FunctionalConfiguration<TValues> = (blueprint) => Promiseable<void>;
```

FunctionalConfiguration Type.

Represents a function that configures the system based on the provided blueprint.

## Type Parameters

### TValues

`TValues` *extends* `object` = `any`

## Parameters

### blueprint

[`IBlueprint`](IBlueprint.md)\<`TValues`\>

The blueprint to configure.

## Returns

[`Promiseable`](Promiseable.md)\<`void`\>

A promise that resolves when the configuration is complete.
