# Function: Snapshot()

```ts
function Snapshot<T>(name?): MethodDecorator;
```

Decorator to create a snapshot of the current data.

## Type Parameters

### T

`T` *extends* `Function` = `Function`

## Parameters

### name?

`string`

The name of the snapshot.

## Returns

`MethodDecorator`

A method decorator.

## Example

```typescript
import { Service } from '@stone-js/core';
import { Snapshot } from '@stone-js/use-react';

@Service({ alias: 'userService' })
class UserService {
  @Snapshot()
  showProfile() {
    return { name: 'John Doe' };
  }
}
```
