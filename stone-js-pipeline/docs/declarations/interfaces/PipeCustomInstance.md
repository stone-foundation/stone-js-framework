# Interface: PipeCustomInstance\<T, R\>

Represents a pipe instance that contains different pipe functions.

## Type Parameters

### T

`T` = `unknown`

The type of the passable object.

### R

`R` = `T`

The type of the return value from the pipeline execution, defaulting to `T`.

An object representing a set of functions used as part of the pipeline.
The keys represent function names, and the values are functions that take specific arguments.

## Indexable

```ts
[key: string]: FunctionalPipe<T, R>
```
