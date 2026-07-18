# Type Alias: PipeType\<T, R, Args\>

```ts
type PipeType<T, R, Args> = 
  | PipeAlias
  | PipeClass<T, R, Args>
  | FunctionalPipe<T, R>
| FactoryPipe<T, R, Args>;
```

A type that can either be a function or a string, representing a pipeline step.

A pipe can either be a function that performs an action or a string identifier to be resolved.

## Type Parameters

### T

`T` = `unknown`

### R

`R` = `T`

### Args

`Args` *extends* `any`[] = `any`[]
