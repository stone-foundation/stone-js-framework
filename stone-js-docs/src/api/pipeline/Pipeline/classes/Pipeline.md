# Class: Pipeline\<T, R, Args\>

Class representing a Pipeline.

## Type Parameters

### T

`T` = `unknown`

The type of the passable object in the pipeline.

### R

`R` = `T`

The type of the return value from the pipeline execution.

This class is responsible for managing and executing a series of operations
on a set of passable values through multiple configurable pipes.

### Args

`Args` *extends* `any`[] = `any`[]

## Constructors

### Constructor

```ts
protected new Pipeline<T, R, Args>(options?): Pipeline<T, R, Args>;
```

Initialize a new Pipeline instance.

#### Parameters

##### options?

[`PipelineOptions`](../../declarations/interfaces/PipelineOptions.md)\<`T`, `R`, `Args`\>

Optional Pipeline options.

#### Returns

`Pipeline`\<`T`, `R`, `Args`\>

## Methods

### defaultPriority()

```ts
defaultPriority(value): this;
```

Set the default priority for pipes in the pipeline.

#### Parameters

##### value

`number`

The priority value to set.

#### Returns

`this`

The current Pipeline instance.

***

### on()

```ts
on(name, listener): this;
```

Add a hook to the pipeline.

#### Parameters

##### name

[`HookName`](../../declarations/type-aliases/HookName.md)

The name of the hook.

##### listener

The hook listener function.

[`PipelineHookListener`](../../declarations/type-aliases/PipelineHookListener.md)\<`T`, `R`, `Args`\> | [`PipelineHookListener`](../../declarations/type-aliases/PipelineHookListener.md)\<`T`, `R`, `Args`\>[]

#### Returns

`this`

The current Pipeline instance.

***

### pipe()

```ts
pipe(...pipe): this;
```

Add additional pipes to the pipeline.

#### Parameters

##### pipe

...[`MixedPipe`](../../declarations/type-aliases/MixedPipe.md)\<`T`, `R`, `Args`\>[]

A single pipe or a list of pipes to add.

#### Returns

`this`

The current Pipeline instance.

***

### send()

```ts
send(passable): this;
```

Set the passable objects being sent through the pipeline.

#### Parameters

##### passable

`T`

The object to pass through the pipeline.

#### Returns

`this`

The current Pipeline instance.

***

### sync()

```ts
sync(value): this;
```

Configure the pipeline to run synchronously or asynchronously.

#### Parameters

##### value

`boolean` = `true`

Set true for sync, false for async (default is true).

#### Returns

`this`

The current Pipeline instance.

***

### then()

```ts
then(destination): Promiseable<R>;
```

Run the pipeline with a final destination callback.

#### Parameters

##### destination

[`PipeExecutor`](../../declarations/type-aliases/PipeExecutor.md)\<`T`, `R`\>

The final function to execute.

#### Returns

[`Promiseable`](../../declarations/type-aliases/Promiseable.md)\<`R`\>

The result of the pipeline, either synchronously or as a Promise.

***

### thenReturn()

```ts
thenReturn(): Promiseable<R>;
```

Run the pipeline and return the result.

#### Returns

[`Promiseable`](../../declarations/type-aliases/Promiseable.md)\<`R`\>

The result of the pipeline, either synchronously or as a Promise.

***

### through()

```ts
through(...pipes): this;
```

Set the pipes for the pipeline.

#### Parameters

##### pipes

...[`MixedPipe`](../../declarations/type-aliases/MixedPipe.md)\<`T`, `R`, `Args`\>[]

The pipes or MetaPipe instances.

#### Returns

`this`

The current Pipeline instance.

***

### via()

```ts
via(method): this;
```

Set the method to call on each pipe.

#### Parameters

##### method

`string`

The method name to use on each pipe.

#### Returns

`this`

The current Pipeline instance.

***

### create()

```ts
static create<T, R, Args>(options?): Pipeline<T, R>;
```

Create a pipeline instance.

#### Type Parameters

##### T

`T` = `unknown`

##### R

`R` = `T`

##### Args

`Args` *extends* `any`[] = `any`[]

#### Parameters

##### options?

[`PipelineOptions`](../../declarations/interfaces/PipelineOptions.md)\<`T`, `R`, `Args`\>

Optional Pipeline options.

#### Returns

`Pipeline`\<`T`, `R`\>

The pipeline instance.
