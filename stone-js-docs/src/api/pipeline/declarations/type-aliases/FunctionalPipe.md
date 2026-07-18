# Type Alias: FunctionalPipe()\<T, R\>

```ts
type FunctionalPipe<T, R> = (passable, next, ...params) => Promiseable<R>;
```

A function type that represents a pipe.

## Type Parameters

### T

`T` = `unknown`

### R

`R` = `T`

## Parameters

### passable

`T`

### next

[`PipeExecutor`](PipeExecutor.md)\<`T`, `R`\>

### params

...`any`[]

## Returns

[`Promiseable`](Promiseable.md)\<`R`\>
