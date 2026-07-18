# Interface: PipelineHookContext\<T, R, Args\>

PipelineHookContext Type.

## Type Parameters

### T

`T` = `unknown`

### R

`R` = `T`

### Args

`Args` *extends* `any`[] = `any`[]

## Properties

### instance

```ts
instance: PipeCustomInstance<T, R>;
```

***

### passable

```ts
passable: T;
```

***

### pipe

```ts
pipe: MetaPipe<T, R, Args>;
```

***

### pipes

```ts
pipes: MetaPipe<T, R, Args>[];
```
