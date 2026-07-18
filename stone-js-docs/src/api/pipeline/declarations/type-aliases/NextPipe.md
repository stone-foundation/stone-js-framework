# Type Alias: NextPipe\<T, R\>

```ts
type NextPipe<T, R> = PipeExecutor<T, R>;
```

Next Pipe Executor function type.

## Type Parameters

### T

`T` = `unknown`

The type of the passable object.

### R

`R` = `T`

The type of the return value from the pipeline execution, defaulting to `T`.

## Param

The passable objects being sent through the pipeline.

## Returns

The result of the execution, which could be a synchronous or asynchronous response.
