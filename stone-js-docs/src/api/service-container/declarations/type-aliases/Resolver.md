# Type Alias: Resolver()\<V\>

```ts
type Resolver<V> = (container) => V;
```

A resolver function that takes a container and returns a value of type V.

## Type Parameters

### V

`V`

The type of value that the resolver returns.

## Parameters

### container

[`Container`](../../Container/classes/Container.md)

The container used to resolve dependencies.

## Returns

`V`

The resolved value of type V.

## Example

```typescript
const myResolver: Resolver<number> = (container: Container) => {
  // Use the container to resolve dependencies and return a number.
  return 42;
};
```
