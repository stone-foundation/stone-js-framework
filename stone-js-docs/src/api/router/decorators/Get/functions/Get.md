# Function: Get()

```ts
function Get(path, options?): MethodDecorator;
```

Decorator to mark a class method as a `GET` route action.
Uses the `Match` decorator internally to register the route with the HTTP `GET` method.

## Parameters

### path

`string` | `string`[]

### options?

[`GetOptions`](../interfaces/GetOptions.md)

Configuration options for the route definition, excluding the `methods` property.

## Returns

`MethodDecorator`

A method decorator to be applied to a class method.

## Example

```typescript
import { Get } from '@stone-js/router';

class UserController {
  @Get({ path: '/users', name: 'getUsers' })
  getUsers() {
    return 'List of users';
  }
}
```
