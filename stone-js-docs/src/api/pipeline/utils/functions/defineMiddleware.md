# Function: defineMiddleware()

```ts
function defineMiddleware<T, R, Args>(module, options): MetaPipe<T, R, Args>;
```

Define a new middleware for the pipeline.

## Type Parameters

### T

`T` = `unknown`

### R

`R` = `T`

### Args

`Args` *extends* `any`[] = `any`[]

## Parameters

### module

[`PipeType`](../../declarations/type-aliases/PipeType.md)\<`T`, `R`, `Args`\>

The pipe module to add to the pipeline.

### options

`Omit`\<[`MetaPipe`](../../declarations/interfaces/MetaPipe.md)\<`T`, `R`, `Args`\>, `"module"`\> = `{}`

Additional options for the middleware.

## Returns

[`MetaPipe`](../../declarations/interfaces/MetaPipe.md)\<`T`, `R`, `Args`\>

The metadata for the middleware.
