# Type Alias: FactoryPipe()\<T, R, Args\>

```ts
type FactoryPipe<T, R, Args> = (...args) => FunctionalPipe<T, R>;
```

A factory function type that represents a pipe.

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

[`FunctionalPipe`](FunctionalPipe.md)\<`T`, `R`\>
