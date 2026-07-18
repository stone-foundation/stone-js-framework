# Type Alias: PipeClass()\<T, R, Args\>

```ts
type PipeClass<T, R, Args> = (...args) => PipeInstance<T, R>;
```

A class type that represents a pipe.

## Type Parameters

### T

`T` = `unknown`

### R

`R` = `T`

### Args

`Args` *extends* `any`[] = `any`[]

## Parameters

### args

...`Args`

## Returns

[`PipeInstance`](PipeInstance.md)\<`T`, `R`\>
