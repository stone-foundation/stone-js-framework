# Function: isFactoryPipe()

```ts
function isFactoryPipe<T, R, Args>(metaPipe): metaPipe is { module: FactoryPipe<T, R, Args> };
```

Check if the meta pipe is a factory pipe.

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

`metaPipe is { module: FactoryPipe<T, R, Args> }`

`true` if the meta pipe is a factory pipe, otherwise `false`.
