# Function: isFunctionPipe()

```ts
function isFunctionPipe<T, R, Args>(metaPipe): metaPipe is { module: FunctionalPipe<T, R> };
```

Check if the meta pipe is a function pipe.

## Type Parameters

### T

`T` = `unknown`

### R

`R` = `T`

### Args

`Args` *extends* `any`[] = `any`[]

## Parameters

### metaPipe

[`MetaPipe`](../../declarations/interfaces/MetaPipe.md)\<`T`, `R`, `Args`\>

The meta pipe to check.

## Returns

`metaPipe is { module: FunctionalPipe<T, R> }`

`true` if the meta pipe is a function pipe, otherwise `false`.
