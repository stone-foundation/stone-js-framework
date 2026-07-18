# Function: NodeHttp()

```ts
function NodeHttp<T>(options): ClassDecorator;
```

A class decorator for registering a Node.js HTTP adapter in the Stone.js framework.

The decorator modifies the `nodeHttpAdapterBlueprint` by merging the provided options
with the default configuration. It also registers the blueprint to the target class using
the `addBlueprint` utility.

## Type Parameters

### T

`T` *extends* `ClassType` = `ClassType`

The type of the class being decorated, defaulting to `ClassType`.

## Parameters

### options

[`NodeHttpOptions`](../interfaces/NodeHttpOptions.md) = `{}`

An object containing configuration options for the Node.js HTTP adapter.

## Returns

`ClassDecorator`

A class decorator function.

## Example

```typescript
import { NodeHttp } from '@stone-js/node-http';

@NodeHttp({
  url: 'http://localhost:3000',
  default: true,
})
class MyHttpService {
  // Service implementation
}
```
