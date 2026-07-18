# Type Alias: PipeExecutor()\<T, R\>

```ts
type PipeExecutor<T, R> = (passable) => Promiseable<R>;
```

Pipe Executor function type.

## Type Parameters

### T

`T` = `unknown`

The type of the passable object.

### R

`R` = `T`

The type of the return value from the pipeline execution, defaulting to `T`.

## Parameters

### passable

`T`

The passable objects being sent through the pipeline.

## Returns

[`Promiseable`](Promiseable.md)\<`R`\>

The result of the execution, which could be a synchronous or asynchronous response.
