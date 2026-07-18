# Function: PageStatus()

```ts
function PageStatus<T>(statusCode, headers): MethodDecorator;
```

Decorator to set the status code of the response.

## Type Parameters

### T

`T` *extends* `Function` = `Function`

## Parameters

### statusCode

`number` = `200`

The status code of the response.

### headers

[`HeadersType`](../../../declarations/type-aliases/HeadersType.md) = `{}`

The headers for the response.

## Returns

`MethodDecorator`

A method decorator.

## Example

```typescript
import { Page, PageStatus } from '@stone-js/use-react';

@Page('/user-profile')
class UserPage {
  @PageStatus()
  handle() {
    return { name: 'John Doe' };
  }
}
```
