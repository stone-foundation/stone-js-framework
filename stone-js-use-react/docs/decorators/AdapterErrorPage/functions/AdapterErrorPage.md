# Function: AdapterErrorPage()

```ts
function AdapterErrorPage<T>(options): ClassDecorator;
```

A class decorator for defining a class as a React Handler layout.

## Type Parameters

### T

`T` *extends* `ClassType` = `ClassType`

## Parameters

### options

[`AdapterErrorPageOptions`](../../../declarations/interfaces/AdapterErrorPageOptions.md)

Configuration options for the layout definition.

## Returns

`ClassDecorator`

A method decorator to be applied to a class method.

## Example

```typescript
import { AdapterErrorPage } from '@stone-js/use-react';

@AdapterErrorPage({ error: 'UserNotFoundError' })
class UserAdapterErrorPage {
  render({ error }) {
    return <h1>User name: {error.message}</h1>;
  }
}
```
