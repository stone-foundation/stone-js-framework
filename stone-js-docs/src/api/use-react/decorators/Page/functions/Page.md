# Function: Page()

```ts
function Page<T>(path, options): ClassDecorator;
```

A class decorator for defining a class as a React Page route action.
Uses the `Match` decorator internally to register the route with the HTTP `GET` method.

## Type Parameters

### T

`T` *extends* `ClassType` = `ClassType`

## Parameters

### path

`string`

### options

[`PageOptions`](../../../declarations/interfaces/PageOptions.md) = `{}`

Configuration options for the route definition, excluding the `methods` property.

## Returns

`ClassDecorator`

A method decorator to be applied to a class method.

## Example

```typescript
import { Page } from '@stone-js/use-react';

@Page('/user-profile')
class UserPage {
  handle({ event }): Record<string, string> {
    return { name: 'Jane Doe' };
  }

  render({ data }) {
    return <h1>User name: {data.name}</h1>;
  }
}
```
