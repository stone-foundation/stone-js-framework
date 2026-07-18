# Function: ErrorPage()

```ts
function ErrorPage<T>(options): ClassDecorator;
```

A class decorator for defining a class as a React Handler layout.

## Type Parameters

### T

`T` *extends* `ClassType` = `ClassType`

## Parameters

### options

[`ErrorPageOptions`](../../../declarations/interfaces/ErrorPageOptions.md)

Configuration options for the layout definition.

## Returns

`ClassDecorator`

A method decorator to be applied to a class method.

## Example

```typescript
import { ErrorPage } from '@stone-js/use-react';

@ErrorPage({ error: 'UserNotFoundError' })
class UserErrorPage {
  render({ error }) {
    return <h1>User name: {error.message}</h1>;
  }
}
```
