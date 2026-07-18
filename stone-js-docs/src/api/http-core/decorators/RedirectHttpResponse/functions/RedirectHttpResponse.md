# Function: RedirectHttpResponse()

```ts
function RedirectHttpResponse<T>(statusCode, headers): MethodDecorator;
```

Decorator to mark a class method as a redirect outgoing http response.

## Type Parameters

### T

`T` *extends* `Function` = `Function`

## Parameters

### statusCode

`number` = `HTTP_OK`

The status code of the response.

### headers

[`HeadersType`](../../../declarations/type-aliases/HeadersType.md) = `{}`

The headers for the response.

## Returns

`MethodDecorator`

A method decorator.

## Example

```typescript
import { RedirectHttpResponse } from '@stone-js/http-core';

class UserController {
  @RedirectHttpResponse()
  getUsers() {
    return new URL('https://www.google.com');
  }
}
```
