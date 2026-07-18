# Type Alias: PipelineHookListener()\<T, R, Args\>

```ts
type PipelineHookListener<T, R, Args> = (context) => Promiseable<void>;
```

PipelineHookListener Type.

Represents a listener hook that can either be synchronous or asynchronous.

## Type Parameters

### T

`T` = `unknown`

### R

`R` = `T`

### Args

`Args` *extends* `any`[] = `any`[]

## Parameters

### context

[`PipelineHookContext`](../interfaces/PipelineHookContext.md)\<`T`, `R`, `Args`\>

## Returns

[`Promiseable`](Promiseable.md)\<`void`\>
