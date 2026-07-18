# Type Alias: MixedPipe\<T, R, Args\>

```ts
type MixedPipe<T, R, Args> = 
  | PipeType<T, R, Args>
| MetaPipe<T, R, Args>;
```

A mixed type that can be either a simple Pipe or a MetaPipe configuration.

## Type Parameters

### T

`T` = `unknown`

### R

`R` = `T`

### Args

`Args` *extends* `any`[] = `any`[]
