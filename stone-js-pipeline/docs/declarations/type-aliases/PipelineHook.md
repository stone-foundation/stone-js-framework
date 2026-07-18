# Type Alias: PipelineHook\<T, R, Args\>

```ts
type PipelineHook<T, R, Args> = Record<HookName, PipelineHookListener<T, R, Args>[]>;
```

Hook Type.

Represents a hook that can either be synchronous or asynchronous.

## Type Parameters

### T

`T` = `unknown`

### R

`R` = `T`

### Args

`Args` *extends* `any`[] = `any`[]
