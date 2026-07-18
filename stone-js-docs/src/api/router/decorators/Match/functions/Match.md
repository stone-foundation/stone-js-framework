# Function: Match()

```ts
function Match<T>(path, options?): MethodDecorator;
```

Decorator to mark a class method as a route action.
Automatically registers the method with route definitions using metadata.

## Type Parameters

### T

`T` *extends* `Function` = `Function`

## Parameters

### path

`string` | `string`[]

### options?

[`MatchOptions`](../interfaces/MatchOptions.md)

Partial configuration for the route definition.

## Returns

`MethodDecorator`

A method decorator.

## Example

```typescript
import { Match } from '@stone-js/router';

class UserController {
  @Match({ path: '/users', method: 'GET', name: 'getUsers' })
  getUsers() {
    return 'List of users';
  }
}
```
