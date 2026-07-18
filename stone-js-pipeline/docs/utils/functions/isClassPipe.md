# Function: isClassPipe()

```ts
function isClassPipe<T, R, Args>(metaPipe): metaPipe is { module: PipeClass<T, R, Args> };
```

Check if the meta pipe is a class pipe.

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

`metaPipe is { module: PipeClass<T, R, Args> }`

`true` if the meta pipe is a class pipe, otherwise `false`.
