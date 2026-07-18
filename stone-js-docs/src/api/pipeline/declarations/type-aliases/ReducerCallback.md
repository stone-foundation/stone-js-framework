# Type Alias: ReducerCallback()\<T, R, Args\>

```ts
type ReducerCallback<T, R, Args> = (previousPipeExecutor, currentPipe) => PipeExecutor<T, R>;
```

Reducer callback function type used to build a sequence of pipe executions.

## Type Parameters

### T

`T` = `unknown`

The type of the passable object.

### R

`R` = `T`

The type of the return value from the pipeline execution, defaulting to `T`.

### Args

`Args` *extends* `any`[] = `any`[]

## Parameters

### previousPipeExecutor

[`PipeExecutor`](PipeExecutor.md)\<`T`, `R`\>

The executor from the previous step in the pipeline.

### currentPipe

[`MetaPipe`](../interfaces/MetaPipe.md)\<`T`, `R`, `Args`\>

The current pipe being added to the sequence.

## Returns

[`PipeExecutor`](PipeExecutor.md)\<`T`, `R`\>

The combined executor function.
