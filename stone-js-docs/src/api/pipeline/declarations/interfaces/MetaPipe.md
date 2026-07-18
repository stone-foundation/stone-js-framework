# Interface: MetaPipe\<T, R, Args\>

Represents a MetaPipe configuration item, with a pipe, parameters, and priority level.

A configuration object used for managing pipes in the pipeline.

## Type Parameters

### T

`T` = `unknown`

### R

`R` = `T`

### Args

`Args` *extends* `any`[] = `any`[]

## Properties

### isAlias?

```ts
optional isAlias: boolean;
```

An optional flag indicating whether the pipe is a container alias.

***

### isClass?

```ts
optional isClass: boolean;
```

An optional flag indicating whether the pipe is a class.

***

### isFactory?

```ts
optional isFactory: boolean;
```

An optional flag indicating whether the pipe is a factory.

***

### module

```ts
module: PipeType<T, R, Args>;
```

The pipe to execute, which can be a function or a string identifier.

***

### params?

```ts
optional params: any[];
```

An optional array of parameters to pass to the pipe.

***

### priority?

```ts
optional priority: number;
```

An optional priority level of the pipe.
