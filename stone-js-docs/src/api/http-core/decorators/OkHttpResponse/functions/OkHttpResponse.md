# Function: OkHttpResponse()

```ts
function OkHttpResponse<T>(headers): MethodDecorator;
```

Decorator to mark a class method as a 200 outgoing http response.

## Type Parameters

### T

`T` *extends* `Function` = `Function`

## Parameters

### headers

[`HeadersType`](../../../declarations/type-aliases/HeadersType.md) = `{}`

The headers for the response.

## Returns

`MethodDecorator`

A method decorator.

## Example

```typescript
import { OkHttpResponse } from '@stone-js/http-core';

class UserController {
  @OkHttpResponse()
  getUsers() {
    return { name: 'John Doe' };
  }
}
```
