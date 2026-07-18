# Type Alias: PipeResolver()\<T, R, Args\>

```ts
type PipeResolver<T, R, Args> = (pipe) => PipeInstance<T, R> | undefined;
```

A function type that represents a resolver for a given pipe.

## Type Parameters

### T

`T` = `unknown`

The type of the passable object in the pipeline.

### R

`R` = `T`

The type of the return value from the resolved pipe, which defaults to `T`.

### Args

`Args` *extends* `any`[] = `any`[]

## Parameters

### pipe

[`MetaPipe`](../interfaces/MetaPipe.md)\<`T`, `R`, `Args`\>

The pipe that needs to be resolved, which can be either a simple pipe or a MetaPipe.

## Returns

[`PipeInstance`](PipeInstance.md)\<`T`, `R`\> \| `undefined`

The resolved pipe instance of type `PipeInstance<T, R> | undefined`.

This type is used to provide a custom mechanism for resolving pipes before they are executed in the pipeline.
