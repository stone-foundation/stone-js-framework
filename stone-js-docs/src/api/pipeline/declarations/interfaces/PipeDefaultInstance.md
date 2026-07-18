# Interface: PipeDefaultInstance\<T, R\>

Represents a pipe instance that contains a default pipe function.

## Type Parameters

### T

`T` = `unknown`

The type of the passable object.

### R

`R` = `T`

The type of the return value from the pipeline execution, defaulting to `T`.

An object representing a default function used as part of the pipeline.
The key is the `handle` property, which is a function that takes specific arguments.

## Properties

### handle

```ts
handle: FunctionalPipe<T, R>;
```
