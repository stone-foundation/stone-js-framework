# Function: JsonHttpResponse()

```ts
function JsonHttpResponse<T>(statusCode, headers): MethodDecorator;
```

Decorator to mark a class method as a JSON outgoing http response.

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
import { JsonHttpResponse } from '@stone-js/http-core';

class UserController {
  @JsonHttpResponse()
  getUsers() {
    return { name: 'John Doe' };
  }
}
```
