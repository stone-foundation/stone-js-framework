# Function: isAliasPipe()

```ts
function isAliasPipe<T, R, Args>(metaPipe): metaPipe is { module: string };
```

Check if the meta pipe is an alias pipe.

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

`metaPipe is { module: string }`

`true` if the meta pipe is an alias pipe, otherwise `false`.
