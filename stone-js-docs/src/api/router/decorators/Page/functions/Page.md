# Function: Page()

```ts
function Page(path, options?): MethodDecorator;
```

Decorator to mark a class method as a Page route action.
Uses the `Match` decorator internally to register the route with the HTTP `GET` method.

## Parameters

### path

`string` | `string`[]

### options?

[`PageOptions`](../interfaces/PageOptions.md)

Configuration options for the route definition, excluding the `methods` property.

## Returns

`MethodDecorator`

A method decorator to be applied to a class method.

## Example

```typescript
import { Page } from '@stone-js/router';

class UserController {
  @Page({ path: '/users', name: 'getUsers' })
  getUsers() {
    return 'List of users';
  }
}
```
